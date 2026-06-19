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
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PGJKontrakController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PGJ_Kontrak::withTrashed()->latest('id');

        $query->when($request->search, fn($q, $search) => $q->search($search));
        $query->when($request->client_id, fn($q, $value) => $this->filterByClient($q, (int) $value));
        $query->withoutTrashed();

        $users = $request->client_id
            ? $this->usersForClient($request)->paginate(10)->withQueryString()->through(fn(UserAbsensi $user) => $this->serializeUserContractRow($user))
            : null;

        return Inertia::render('PGJKontrak/Index', [
            'users' => $users,
            'contracts' => null,
            'clients' => $this->clientsWithPendingCounts(),
            'selectedClient' => $request->client_id ? $this->clientWithPendingCount((int) $request->client_id) : null,
            'filters' => $request->only(['search', 'client_id']),
            'filterOptions' => [
                'statuses' => ['Karyawan Kontrak', 'Tetap', 'Karyawan Tetap'],
                'jabatans' => PGJ_Kontrak::query()->select('jabatan_pk_kda')->distinct()->whereNotNull('jabatan_pk_kda')->pluck('jabatan_pk_kda'),
                'units' => PGJ_Kontrak::query()->select('unit_pk_kda')->distinct()->whereNotNull('unit_pk_kda')->pluck('unit_pk_kda'),
                'expiredUnits' => PGJ_Kontrak::query()->whereNull('deleted_at')->whereDate('tgl_selesai_kontrak', '<=', now())->distinct()->pluck('unit_pk_kda'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $prefillUserId = null;

        if ($request->filled('u')) {
            $prefillUserId = (int) Crypt::decryptString($request->string('u')->toString());
        }

        return Inertia::render('PGJKontrak/Form', $this->formProps(prefillUserId: $prefillUserId));
    }

    public function store(Request $request): RedirectResponse
    {
        $payload = $this->payload($request);
        $payload['nik_pk_kda'] = Crypt::encryptString($payload['nik_pk_kda']);

        PGJ_Kontrak::create($payload);

        return redirect()->route('admin.pengajuan-kontrak.index')->with('success', 'Pengajuan kontrak berhasil dibuat.');
    }

    public function edit(PGJ_Kontrak $pengajuan_kontrak): Response
    {
        return Inertia::render('PGJKontrak/Form', $this->formProps($pengajuan_kontrak));
    }

    public function update(Request $request, PGJ_Kontrak $pengajuan_kontrak): RedirectResponse
    {
        $payload = $this->payload($request);
        $payload['nama_pk_kda'] = $pengajuan_kontrak->nama_pk_kda;
        $payload['nik_pk_kda'] = Crypt::encryptString($payload['nik_pk_kda']);

        $pengajuan_kontrak->update($payload);

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
        $pengajuan_kontrak->nik_pk_kda = $this->decryptValue($pengajuan_kontrak->nik_pk_kda);
        $pdf = Pdf::loadView('pdf.kontrak-page', ['kontrak' => $pengajuan_kontrak])->setPaper('a4', 'portrait');

        return response()->streamDownload(fn() => print($pdf->output()), 'kontrak-karyawan-' . $pengajuan_kontrak->nama_pk_kda . date('Y-m-d') . '.pdf');
    }

    public function preview(PGJ_Kontrak $pengajuan_kontrak): Response
    {
        $pengajuan_kontrak->nik_pk_kda = $this->decryptValue($pengajuan_kontrak->nik_pk_kda);
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
            return ['detail' => $this->contractDetailForName($name)];
        }

        $mitraId = $request->integer('mitra_id') ?: null;

        return ['people' => $this->peopleOptions($mitraId)];
    }

    private function contractDetailForName(string $name): array
    {
        $selectedUser = UserAbsensi::where('nama_lengkap', $name)->first();
        $selectedEmploye = Employe::where('name', $name)->first();
        $ttl = explode(',', $selectedEmploye?->ttl ?? '');

        $nik = $this->decryptValue($selectedEmploye?->no_ktp);

        if ($this->looksEncrypted($nik)) {
            $nik = $selectedUser?->nik ?? '';
        }

        return [
            'jabatan_pk_kda' => $selectedUser?->jabatan?->name_jabatan ?? '',
            'unit_pk_kda' => $selectedUser?->client?->name ?? '',
            'nik_pk_kda' => $nik,
            'tempat_lahir_pk_kda' => trim($ttl[0] ?? ''),
            'tgl_lahir_pk_kda' => isset($ttl[1]) ? Carbon::parse(trim($ttl[1]))->format('Y-m-d') : '',
            'status_pk_kda' => $selectedUser?->status ?? '',
            'alamat_pk_kda' => $selectedEmploye?->alamat ?? '',
        ];
    }

    private function formProps(?PGJ_Kontrak $contract = null, ?int $prefillUserId = null): array
    {
        $prefillUser = $prefillUserId ? UserAbsensi::with('Kerjasama.Client')->find($prefillUserId) : null;
        $prefillDetail = $prefillUser ? $this->contractDetailForName($prefillUser->nama_lengkap) : null;
        $mitraId = $contract ? $this->clientIdForContract($contract) : $prefillUser?->Kerjasama?->client_id;

        return [
            'contract' => $contract ? $this->serialize($contract) : null,
            'clients' => Client::orderBy('name')->get(['id', 'name']),
            'jabatans' => Jabatan::orderBy('name_jabatan')->pluck('name_jabatan'),
            'people' => $contract ? [$contract->nama_pk_kda] : ($prefillUser ? [$prefillUser->nama_lengkap] : $this->peopleOptions()),
            'mitraId' => $mitraId,
            'prefillName' => $prefillUser?->nama_lengkap,
            'prefillDetail' => $prefillDetail,
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

    private function clientsWithPendingCounts()
    {
        return Client::orderBy('name')->get()->map(fn($client) => $this->setPendingContractsCount($client));
    }

    private function clientWithPendingCount(int $clientId): ?Client
    {
        $client = Client::find($clientId);

        return $client ? $this->setPendingContractsCount($client) : null;
    }

    private function setPendingContractsCount(Client $client): Client
    {
        $query = PGJ_Kontrak::query()->withoutTrashed()->where('send_to_operator', 0);
        $this->filterByClient($query, $client->id);

        $client->pending_contracts_count = $query->count();

        return $client;
    }

    private function usersForClient(Request $request)
    {
        return UserAbsensi::with(['Kerjasama.Client', 'Jabatan'])
            ->whereHas('Kerjasama', fn($query) => $query->where('client_id', $request->integer('client_id')))
            ->where('nama_lengkap', '!=', 'admin')
            ->whereDoesntHave('Jabatan', fn($query) => $query->where('name_jabatan', 'DIREKSI'))
            ->when($request->search, function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('nama_lengkap', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhereHas('Jabatan', fn($jabatan) => $jabatan->where('name_jabatan', 'like', "%{$search}%"))
                        ->orWhereHas('Kerjasama.Client', fn($client) => $client->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderBy('nama_lengkap');
    }

    private function filterByClient($query, int $clientId): void
    {
        $client = Client::find($clientId, ['id', 'name']);
        $userNames = UserAbsensi::whereHas('Kerjasama', fn($inner) => $inner->where('client_id', $clientId))->pluck('nama_lengkap');
        $employeeNames = Employe::where('client_id', $clientId)->pluck('name');
        $names = $userNames->merge($employeeNames)->filter()->unique()->values();

        $query->where(function ($inner) use ($names, $client) {
            $inner->whereIn('nama_pk_kda', $names);

            if ($client) {
                $inner->orWhere('unit_pk_kda', $client->name);
            }
        });
    }

    private function groupContractsByClient($contracts): array
    {
        $contracts = collect($contracts);
        $names = $contracts->pluck('nama_pk_kda')->filter()->unique()->values();
        $unitNames = $contracts->pluck('unit_pk_kda')->filter()->unique()->values();

        $userClients = UserAbsensi::with('Kerjasama.Client')
            ->whereIn('nama_lengkap', $names)
            ->get()
            ->filter(fn($user) => $user->Kerjasama?->Client)
            ->mapWithKeys(fn($user) => [
                $user->nama_lengkap => [
                    'id' => $user->Kerjasama->Client->id,
                    'name' => $user->Kerjasama->Client->name,
                ],
            ]);

        $employeeClients = Employe::with('Client')
            ->whereIn('name', $names)
            ->get()
            ->filter(fn($employee) => $employee->Client)
            ->mapWithKeys(fn($employee) => [
                $employee->name => [
                    'id' => $employee->Client->id,
                    'name' => $employee->Client->name,
                ],
            ]);

        $unitClients = Client::whereIn('name', $unitNames)
            ->get(['id', 'name'])
            ->keyBy(fn($client) => mb_strtolower($client->name));

        return $contracts
            ->groupBy(function ($contract) use ($userClients, $employeeClients, $unitClients) {
                $client = $userClients->get($contract['nama_pk_kda'])
                    ?: $employeeClients->get($contract['nama_pk_kda'])
                    ?: $unitClients->get(mb_strtolower($contract['unit_pk_kda'] ?? ''))?->only(['id', 'name'])->toArray()
                    ?: ['id' => null, 'name' => 'Tanpa Mitra'];

                return ($client['id'] ?? 'none') . '|' . ($client['name'] ?? 'Tanpa Mitra');
            })
            ->map(function ($clientContracts, $key) {
                [$id, $name] = explode('|', $key, 2);

                return [
                    'id' => $id === 'none' ? null : (int) $id,
                    'name' => $name,
                    'contracts_count' => $clientContracts->count(),
                    'users_count' => $clientContracts->pluck('nama_pk_kda')->unique()->count(),
                    'contracts' => $clientContracts->values()->all(),
                ];
            })
            ->sortBy('name')
            ->values()
            ->toArray();
    }

    private function clientIdForContract(PGJ_Kontrak $contract): ?int
    {
        $user = UserAbsensi::where('nama_lengkap', $contract->nama_pk_kda)->first();

        if ($user?->Kerjasama?->client_id) {
            return $user->Kerjasama->client_id;
        }

        $employee = Employe::where('name', $contract->nama_pk_kda)->first();

        if ($employee?->client_id) {
            return $employee->client_id;
        }

        return Client::where('name', $contract->unit_pk_kda)->value('id');
    }

    private function peopleOptions(?int $mitraId = null): array
    {
        $edataDb = config('database.connections.mysqlEdata.database');
        $contractTable = $edataDb . '.p_g_j__kontraks';

        $userAbsensi = UserAbsensi::where('nama_lengkap', '!=', 'admin')
            ->whereIn('nama_lengkap', function ($query) use ($contractTable) {
                $query->select('nama_pk_kda')->from($contractTable)->whereNull('deleted_at')->whereDate('tgl_selesai_kontrak', '<=', Carbon::today()->toDateString());
            })
            ->whereNotIn('nama_lengkap', function ($query) use ($contractTable) {
                $query->select('nama_pk_kda')->from($contractTable)->whereNull('deleted_at')->whereDate('tgl_selesai_kontrak', '>', Carbon::today()->toDateString());
            })
            ->when($mitraId, fn($q) => $q->whereHas('kerjasama', fn($inner) => $inner->where('client_id', $mitraId)))
            ->pluck('nama_lengkap', 'nama_lengkap')
            ->toArray();

        $employees = Employe::when($mitraId, fn($q) => $q->where('client_id', $mitraId))
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
            return '001/SAC/' . strtoupper(now()->format('m')) . '/' . now()->year;
        }

        $parts = explode('/', $last->no_srt);
        $parts[0] = (int) $parts[0] + 1;

        return implode('/', $parts);
    }

    private function looksEncrypted(?string $value): bool
    {
        if (! $value) {
            return false;
        }

        $decoded = json_decode(base64_decode($value, true) ?: '', true);

        return is_array($decoded) && isset($decoded['iv'], $decoded['value'], $decoded['mac']);
    }

    private function decryptValue(?string $value): string
    {
        if (! $value) {
            return '';
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Throwable) {
            try {
                return (string) Crypt::decrypt($value);
            } catch (\Throwable) {
                return $value;
            }
        }
    }

    private function serializeUserContractRow(UserAbsensi $user): array
    {
        $contract = PGJ_Kontrak::query()
            ->whereNull('deleted_at')
            ->where('nama_pk_kda', $user->nama_lengkap)
            ->latest('id')
            ->first();

        return [
            'id' => $user->id,
            'create_token' => Crypt::encryptString((string) $user->id),
            'nama_lengkap' => $user->nama_lengkap,
            'mitra' => $user->Kerjasama?->Client?->name ?? '-',
            'jabatan' => $user->Jabatan?->name_jabatan ?? '-',
            'contract' => $contract ? $this->serialize($contract) : null,
            'masa_berlaku' => $contract ? $contract->tgl_mulai_kontrak . ' - ' . $contract->tgl_selesai_kontrak : null,
            'ttd' => (bool) $contract?->ttd,
            'send_to_operator' => (bool) $contract?->send_to_operator,
            'expired' => $contract ? now()->greaterThan(Carbon::parse($contract->tgl_selesai_kontrak)) : false,
            'keterangan' => $contract && now()->greaterThan(Carbon::parse($contract->tgl_selesai_kontrak)) ? 'Kontrak habis / expired' : '-',
            'status_pengajuan_kontrak' => $contract?->status_pk_kda ?? 'Belum Pengajuan',
        ];
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
            'nik_pk_kda' => $this->decryptValue($contract->nik_pk_kda),
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
