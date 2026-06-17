<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Employe;
use App\Models\Jabatan;
use App\Models\PGJ_Kontrak;
use App\Models\UserAbsensi;
use App\Notifications\ContractActive;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PGJKontrakController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PGJ_Kontrak::withTrashed()->latest('id');

        $query->when($request->search, fn ($q, $search) => $q->search($search));
        $query->when($request->status_pk_kda, fn ($q, $value) => $q->where('status_pk_kda', $value));
        $query->when($request->jabatan_pk_kda, fn ($q, $value) => $q->where('jabatan_pk_kda', $value));
        $query->when($request->unit_pk_kda, fn ($q, $value) => $q->where('unit_pk_kda', $value));
        $query->when($request->kontrak_habis, fn ($q, $value) => $q->where('unit_pk_kda', $value)->whereDate('tgl_selesai_kontrak', '<=', now()));

        if ($request->trashed === 'only') {
            $query->onlyTrashed();
        } elseif ($request->trashed !== 'with') {
            $query->withoutTrashed();
        }

        return Inertia::render('PGJKontrak/Index', [
            'contracts' => $query->paginate(10)->withQueryString()->through(fn (PGJ_Kontrak $contract) => $this->serialize($contract)),
            'filters' => $request->only(['search', 'status_pk_kda', 'jabatan_pk_kda', 'unit_pk_kda', 'kontrak_habis', 'trashed']),
            'filterOptions' => [
                'statuses' => ['Karyawan Kontrak', 'Tetap', 'Karyawan Tetap'],
                'jabatans' => PGJ_Kontrak::query()->select('jabatan_pk_kda')->distinct()->whereNotNull('jabatan_pk_kda')->pluck('jabatan_pk_kda'),
                'units' => PGJ_Kontrak::query()->select('unit_pk_kda')->distinct()->whereNotNull('unit_pk_kda')->pluck('unit_pk_kda'),
                'expiredUnits' => PGJ_Kontrak::query()->whereNull('deleted_at')->whereDate('tgl_selesai_kontrak', '<=', now())->distinct()->pluck('unit_pk_kda'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('PGJKontrak/Form', $this->formProps());
    }

    public function store(Request $request): RedirectResponse
    {
        PGJ_Kontrak::create($this->payload($request));

        return redirect()->route('admin.pengajuan-kontrak.index')->with('success', 'Pengajuan kontrak berhasil dibuat.');
    }

    public function edit(PGJ_Kontrak $pengajuan_kontrak): Response
    {
        return Inertia::render('PGJKontrak/Form', $this->formProps($pengajuan_kontrak));
    }

    public function update(Request $request, PGJ_Kontrak $pengajuan_kontrak): RedirectResponse
    {
        $pengajuan_kontrak->update($this->payload($request));

        return redirect()->route('admin.pengajuan-kontrak.index')->with('success', 'Pengajuan kontrak berhasil diupdate.');
    }

    public function show(PGJ_Kontrak $pengajuan_kontrak): Response
    {
        return Inertia::render('PGJKontrak/Show', ['contract' => $this->serialize($pengajuan_kontrak)]);
    }

    public function destroy(PGJ_Kontrak $pengajuan_kontrak): RedirectResponse
    {
        $pengajuan_kontrak->delete();

        return back()->with('warning', 'Pengajuan kontrak berhasil dihapus.');
    }

    public function restore(int $id): RedirectResponse
    {
        PGJ_Kontrak::withTrashed()->findOrFail($id)->restore();

        return back()->with('success', 'Pengajuan kontrak berhasil direstore.');
    }

    public function forceDelete(int $id): RedirectResponse
    {
        PGJ_Kontrak::withTrashed()->findOrFail($id)->forceDelete();

        return back()->with('warning', 'Pengajuan kontrak berhasil dihapus permanen.');
    }

    public function pdf(PGJ_Kontrak $pengajuan_kontrak)
    {
        $pdf = Pdf::loadView('pdf.kontrak-page', ['kontrak' => $pengajuan_kontrak])->setPaper('a4', 'portrait');

        return response()->streamDownload(fn () => print($pdf->output()), 'kontrak-karyawan-'.$pengajuan_kontrak->nama_pk_kda.date('Y-m-d').'.pdf');
    }

    public function preview(PGJ_Kontrak $pengajuan_kontrak): Response
    {
        $pdf = Pdf::loadView('pdf.kontrak-page', ['kontrak' => $pengajuan_kontrak])->setPaper('a4', 'portrait');

        return Inertia::render('PGJKontrak/Preview', [
            'contract' => $this->serialize($pengajuan_kontrak),
            'pdfContent' => base64_encode($pdf->output()),
        ]);
    }

    public function sendToOperator(PGJ_Kontrak $pengajuan_kontrak): RedirectResponse
    {
        if ((int) $pengajuan_kontrak->send_to_operator === 1) {
            return back()->with('warning', 'Kontrak sudah dikirim ke operator.');
        }

        $user = UserAbsensi::where('nama_lengkap', $pengajuan_kontrak->nama_pk_kda)->first();
        $pengajuan_kontrak->update(['send_to_operator' => 1]);
        $user?->notify(new ContractActive());

        return back()->with('success', 'Berhasil diverifikasi & Notif Ke Email User.');
    }

    public function options(Request $request): array
    {
        $name = $request->string('name')->toString();

        if ($name) {
            $selectedUser = UserAbsensi::where('nama_lengkap', $name)->first();
            $selectedEmploye = Employe::where('name', $name)->first();
            $ttl = explode(',', $selectedEmploye?->ttl ?? '');

            return [
                'detail' => [
                    'jabatan_pk_kda' => $selectedUser?->jabatan?->name_jabatan ?? '',
                    'unit_pk_kda' => $selectedUser?->client?->name ?? '',
                    'nik_pk_kda' => $selectedEmploye?->no_ktp ?? '',
                    'tempat_lahir_pk_kda' => trim($ttl[0] ?? ''),
                    'tgl_lahir_pk_kda' => isset($ttl[1]) ? Carbon::parse(trim($ttl[1]))->format('Y-m-d') : '',
                    'status_pk_kda' => $selectedUser?->status ?? '',
                    'alamat_pk_kda' => $selectedEmploye?->alamat ?? '',
                ],
            ];
        }

        $mitraId = $request->integer('mitra_id') ?: null;

        return ['people' => $this->peopleOptions($mitraId)];
    }

    private function formProps(?PGJ_Kontrak $contract = null): array
    {
        return [
            'contract' => $contract ? $this->serialize($contract) : null,
            'clients' => Client::orderBy('name')->get(['id', 'name']),
            'jabatans' => Jabatan::orderBy('name_jabatan')->pluck('name_jabatan'),
            'people' => $this->peopleOptions(),
            'nextNoSurat' => $this->nextNoSurat(),
        ];
    }

    private function payload(Request $request): array
    {
        return $request->validate([
            'no_srt' => ['required', 'string', 'max:255'],
            'tgl_dibuat' => ['required', 'date'],
            'nama_pk_ptm' => ['required', 'string', 'max:255'],
            'alamat_pk_ptm' => ['nullable', 'string', 'max:255'],
            'jabatan_pk_ptm' => ['required', 'string', 'max:255'],
            'nama_pk_kda' => ['required', 'string', 'max:255'],
            'tempat_lahir_pk_kda' => ['required', 'string', 'max:255'],
            'tgl_lahir_pk_kda' => ['required', 'date'],
            'nik_pk_kda' => ['required', 'string', 'max:255'],
            'alamat_pk_kda' => ['required', 'string', 'max:255'],
            'jabatan_pk_kda' => ['required', 'string', 'max:255'],
            'status_pk_kda' => ['required', 'string', 'max:255'],
            'unit_pk_kda' => ['required', 'string', 'max:255'],
            'tgl_mulai_kontrak' => ['required', 'date'],
            'tgl_selesai_kontrak' => ['required', 'date'],
            'g_pok' => ['nullable', 'numeric'],
            'tj_hadir' => ['nullable', 'numeric'],
            'kinerja' => ['nullable', 'numeric'],
            'lain_lain' => ['nullable', 'numeric'],
        ]);
    }

    private function peopleOptions(?int $mitraId = null): array
    {
        $edataDb = config('database.connections.mysqlEdata.database');
        $contractTable = $edataDb.'.p_g_j__kontraks';

        $userAbsensi = UserAbsensi::where('nama_lengkap', '!=', 'admin')
            ->whereIn('nama_lengkap', function ($query) use ($contractTable) {
                $query->select('nama_pk_kda')->from($contractTable)->whereNull('deleted_at')->whereDate('tgl_selesai_kontrak', '<=', Carbon::today()->toDateString());
            })
            ->whereNotIn('nama_lengkap', function ($query) use ($contractTable) {
                $query->select('nama_pk_kda')->from($contractTable)->whereNull('deleted_at')->whereDate('tgl_selesai_kontrak', '>', Carbon::today()->toDateString());
            })
            ->when($mitraId, fn ($q) => $q->whereHas('kerjasama', fn ($inner) => $inner->where('client_id', $mitraId)))
            ->pluck('nama_lengkap', 'nama_lengkap')
            ->toArray();

        $employees = Employe::when($mitraId, fn ($q) => $q->where('client_id', $mitraId))
            ->whereNotIn('name', function ($query) use ($contractTable) {
                $query->select('nama_pk_kda')->from($contractTable)->whereNull('deleted_at');
            })
            ->pluck('name', 'name')
            ->toArray();

        return array_values(array_unique(array_merge($userAbsensi, $employees)));
    }

    private function nextNoSurat(): string
    {
        $last = PGJ_Kontrak::orderBy('id', 'desc')->first();

        if (! $last) {
            return '001/SAC/'.strtoupper(now()->format('m')).'/'.now()->year;
        }

        $parts = explode('/', $last->no_srt);
        $parts[0] = (int) $parts[0] + 1;

        return implode('/', $parts);
    }

    private function serialize(PGJ_Kontrak $contract): array
    {
        $expired = now()->greaterThan(Carbon::parse($contract->tgl_selesai_kontrak));

        return [
            'id' => $contract->id,
            'no_srt' => $contract->no_srt,
            'tgl_dibuat' => $contract->tgl_dibuat,
            'nama_pk_ptm' => $contract->nama_pk_ptm,
            'alamat_pk_ptm' => $contract->alamat_pk_ptm,
            'jabatan_pk_ptm' => $contract->jabatan_pk_ptm,
            'nama_pk_kda' => $contract->nama_pk_kda,
            'tempat_lahir_pk_kda' => $contract->tempat_lahir_pk_kda,
            'tgl_lahir_pk_kda' => $contract->tgl_lahir_pk_kda,
            'nik_pk_kda' => $contract->nik_pk_kda,
            'alamat_pk_kda' => $contract->alamat_pk_kda,
            'jabatan_pk_kda' => $contract->jabatan_pk_kda,
            'status_pk_kda' => $contract->status_pk_kda,
            'unit_pk_kda' => $contract->unit_pk_kda,
            'tgl_mulai_kontrak' => $contract->tgl_mulai_kontrak,
            'tgl_selesai_kontrak' => $contract->tgl_selesai_kontrak,
            'g_pok' => $contract->g_pok,
            'tj_hadir' => $contract->tj_hadir,
            'kinerja' => $contract->kinerja,
            'lain_lain' => $contract->lain_lain,
            'send_to_operator' => (bool) $contract->send_to_operator,
            'ttd' => $contract->ttd,
            'ttd_state' => $contract->ttd ? 'Pihak 2' : ($contract->ttd_atasan ? 'Pihak 1' : 'Belum TTD'),
            'expired' => $expired,
            'deleted_at' => $contract->deleted_at?->toDateTimeString(),
        ];
    }
}
