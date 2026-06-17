<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Employe;
use App\Models\Jabatan;
use App\Models\UserAbsensi;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EmployeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = $this->filteredQuery($request)->with('Client')->latest();

        return Inertia::render('Employes/Index', [
            'employes' => $query->paginate(10)->withQueryString()->through(fn (Employe $employe) => $this->serialize($employe)),
            'filters' => $request->only(['search', 'client_id', 'posisi']),
            'clients' => Client::orderBy('name')->get(['id', 'name']),
            'positions' => Jabatan::on('mysql2connection')->orderBy('name_jabatan')->pluck('name_jabatan'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Employes/Form', [
            'employe' => null,
            'clients' => Client::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Employe::create($this->payload($request));

        return redirect()->route('admin.employes.index')->with('success', 'Employe berhasil dibuat.');
    }

    public function edit(Employe $employe): Response
    {
        return Inertia::render('Employes/Form', [
            'employe' => $this->serialize($employe),
            'clients' => Client::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Employe $employe): RedirectResponse
    {
        $employe->update($this->payload($request, $employe));

        return redirect()->route('admin.employes.index')->with('success', 'Employe berhasil diupdate.');
    }

    public function destroy(Employe $employe): RedirectResponse
    {
        $employe->delete();

        return back()->with('warning', 'Employe berhasil dihapus.');
    }

    public function bulkDelete(Request $request): RedirectResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array']])['ids'];
        Employe::whereIn('id', $ids)->get()->each->delete();

        return back()->with('warning', 'Employe terpilih berhasil dihapus.');
    }

    public function pdf(Request $request)
    {
        $records = $this->filteredQuery($request)->with('Client')->get();
        $pdf = Pdf::loadView('pdf.employes', ['employes' => $records])->setPaper('a4', 'landscape');

        return response()->streamDownload(fn () => print($pdf->output()), 'data-karyawan-'.date('Y-m-d').'.pdf');
    }

    public function clientMeta(Request $request): array
    {
        $client = Client::findOrFail($request->integer('client_id'));
        $last = Employe::where('client_id', $client->id)->max('numbers');

        return [
            'initials' => $this->makeInitials($client->name),
            'numbers' => str_pad($last ? ((int) $last + 1) : 1, 4, '0', STR_PAD_LEFT),
        ];
    }

    private function filteredQuery(Request $request)
    {
        $query = Employe::query();

        $query->when($request->search, function ($q, $search) {
            $q->where(function ($inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('ttl', 'like', "%{$search}%")
                    ->orWhere('no_kk', 'like', "%{$search}%")
                    ->orWhere('no_ktp', 'like', "%{$search}%")
                    ->orWhere('no_bpjs_kesehatan', 'like', "%{$search}%")
                    ->orWhere('no_bpjs_ketenaga', 'like', "%{$search}%")
                    ->orWhere('initials', 'like', "%{$search}%")
                    ->orWhere('numbers', 'like', "%{$search}%");
            });
        });

        $query->when($request->client_id, fn ($q, $clientId) => $q->where('client_id', $clientId));

        if ($request->posisi === 'not_in_absensi') {
            $absensiNames = UserAbsensi::on('mysql2connection')->selectRaw('LOWER(nama_lengkap) as nama')->pluck('nama')->all();
            $query->whereNotIn(DB::raw('LOWER(name)'), $absensiNames);
        } elseif ($request->posisi) {
            $names = UserAbsensi::on('mysql2connection')
                ->whereHas('divisi.jabatan', fn ($q) => $q->where('name_jabatan', $request->posisi))
                ->selectRaw('LOWER(nama_lengkap) as nama')
                ->pluck('nama')
                ->all();
            $query->whereIn(DB::raw('LOWER(name)'), $names);
        }

        return $query;
    }

    private function payload(Request $request, ?Employe $employe = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'ttl' => ['nullable', 'string', 'max:255'],
            'no_kk' => ['required', 'string', 'max:255'],
            'no_ktp' => ['required', 'string', 'max:255'],
            'client_id' => ['required'],
            'initials' => ['required', 'string', 'max:255'],
            'numbers' => ['required', 'string', 'max:255'],
            'date_real' => ['required', 'date'],
            'no_bpjs_kesehatan' => ['nullable', 'string', 'max:255'],
            'no_bpjs_ketenaga' => ['nullable', 'string', 'max:255'],
            'jenis_bpjs' => ['nullable', 'array'],
            'alamat' => ['nullable', 'string'],
            'img' => ['nullable', 'image', 'max:2048'],
            'img_ktp_dpn' => ['nullable', 'image', 'max:2048'],
            'file_bpjs_kesehatan' => ['nullable', 'file', 'mimes:pdf', 'max:4096'],
            'file_bpjs_ketenaga' => ['nullable', 'file', 'mimes:pdf', 'max:4096'],
        ]);

        $data['no_kk'] = Crypt::encryptString($data['no_kk']);
        $data['no_ktp'] = Crypt::encryptString($data['no_ktp']);
        $data['numbers'] = str_pad((int) $data['numbers'], 4, '0', STR_PAD_LEFT);

        foreach (['img' => 'images', 'img_ktp_dpn' => '', 'file_bpjs_kesehatan' => 'bpjs', 'file_bpjs_ketenaga' => 'bpjs'] as $field => $dir) {
            if ($request->hasFile($field)) {
                $data[$field] = $request->file($field)->store($dir, 'public');
            } elseif ($employe) {
                unset($data[$field]);
            }
        }

        return $data;
    }

    private function serialize(Employe $employe): array
    {
        $user = UserAbsensi::whereRaw('LOWER(nama_lengkap) = ?', [strtolower($employe->name)])
            ->with('divisi.jabatan')
            ->first();

        return [
            'id' => $employe->id,
            'name' => $employe->name,
            'ttl' => $employe->ttl,
            'no_kk' => $employe->no_kk,
            'no_ktp' => $employe->no_ktp,
            'client_id' => $employe->client_id,
            'client' => $employe->Client?->name,
            'initials' => $employe->initials,
            'numbers' => $employe->numbers,
            'date_real' => $employe->date_real,
            'img' => $employe->img,
            'img_ktp_dpn' => $employe->img_ktp_dpn,
            'no_bpjs_kesehatan' => $employe->no_bpjs_kesehatan,
            'no_bpjs_ketenaga' => $employe->no_bpjs_ketenaga,
            'file_bpjs_kesehatan' => $employe->file_bpjs_kesehatan,
            'file_bpjs_ketenaga' => $employe->file_bpjs_ketenaga,
            'jenis_bpjs' => $employe->jenis_bpjs ?? [],
            'alamat' => $employe->alamat,
            'posisi' => $user?->divisi?->jabatan?->name_jabatan ?? 'Data NotFound In Absensi',
            'no_induk' => trim(($employe->initials ?? '').' '.($employe->numbers ?? '').' '.($employe->date_real ? date('m-Y', strtotime($employe->date_real)) : '')),
            'created_at' => $employe->created_at?->toDateTimeString(),
        ];
    }

    private function makeInitials(string $name): string
    {
        $clean = preg_replace('/[^\pL\pN\s]+/u', ' ', $name);
        $clean = trim(preg_replace('/\s+/u', ' ', $clean));

        if ($clean === '') {
            return '';
        }

        return collect(explode(' ', $clean))
            ->map(fn ($part) => mb_strtoupper(mb_substr($part, 0, 1, 'UTF-8'), 'UTF-8'))
            ->implode('');
    }
}
