<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employe;
use App\Models\Kerjasama;
use App\Models\TempUsers;
use App\Models\UserAbsensi;
use App\Notifications\UserVerified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TempUsersController extends Controller
{
    public function index(Request $request): Response
    {
        $records = TempUsers::query()
            ->when($request->search, function ($q, $search) {
                $q->where('data->nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('data->email', 'like', "%{$search}%")
                    ->orWhere('data->no_hp', 'like', "%{$search}%");
            })
            ->orderBy('status')
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (TempUsers $record) => $this->serialize($record));

        return Inertia::render('TempUsers/Index', [
            'tempUsers' => $records,
            'filters' => $request->only('search'),
        ]);
    }

    public function verify(TempUsers $temp_user): RedirectResponse
    {
        try {
            DB::transaction(function () use ($temp_user) {
                $data = $temp_user->data;
                $kerjasama = Kerjasama::where('client_id', $data['client_id'] ?? null)->first();

                if (UserAbsensi::where('email', $data['email'] ?? null)->exists() || UserAbsensi::where('name', $data['username'] ?? null)->exists()) {
                    throw new \RuntimeException('User / Email sudah terdaftar');
                }

                $existingNik = UserAbsensi::where('nik', $data['nik'] ?? null)->first();

                if ($existingNik) {
                    if ((int) $existingNik->status_id !== 1) {
                        $existingNik->update(['status_id' => 1]);
                    }
                    $tempAcc = $existingNik;
                } else {
                    $tempAcc = UserAbsensi::create([
                        'name' => $data['username'] ?? null,
                        'nama_lengkap' => $data['nama_lengkap'] ?? null,
                        'kerjasama_id' => $kerjasama?->id,
                        'email' => $data['email'] ?? null,
                        'password' => $data['password'] ?? null,
                        'image' => $data['image'] ?? null,
                        'devisi_id' => $data['devisi_id'] ?? null,
                        'jabatan_id' => $data['jabatan_id'] ?? null,
                        'status_id' => 1,
                        'nik' => $data['nik'] ?? null,
                        'no_hp' => $data['no_hp'] ?? null,
                        'alamat' => $data['alamat'] ?? null,
                    ]);

                    $this->sendDiscordWebhook($tempAcc);
                }

                Employe::create([
                    'name' => $data['nama_lengkap'] ?? null,
                    'ttl' => $data['ttl'] ?? null,
                    'nik' => $data['nik'] ?? null,
                    'no_kk' => $data['no_kk'] ?? null,
                    'client_id' => $data['client_id'] ?? null,
                    'img' => $data['image'] ?? null,
                    'img_ktp_dpn' => $data['img_ktp_dpn'] ?? null,
                    'no_ktp' => 0,
                    'alamat' => $data['alamat'] ?? null,
                ]);

                $temp_user->status = 1;
                $temp_user->save();
                $temp_user->notify(new UserVerified());
            });
        } catch (\Throwable $th) {
            Log::error('Temp user verification failed', ['id' => $temp_user->id, 'error' => $th]);

            return back()->with('error', 'User Gagal diverifikasi: '.$th->getMessage());
        }

        return back()->with('success', 'User berhasil diverifikasi.');
    }

    public function destroy(TempUsers $temp_user): RedirectResponse
    {
        $temp_user->delete();

        return back()->with('warning', 'User Has Been Deleted.');
    }

    public function bulkDelete(Request $request): RedirectResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array']])['ids'];
        TempUsers::whereIn('id', $ids)->delete();

        return back()->with('warning', 'User terpilih berhasil dihapus.');
    }

    private function sendDiscordWebhook(UserAbsensi $user): void
    {
        $webhookUrl = config('services.discord.webhook_url');

        if (! $webhookUrl) {
            return;
        }

        Http::post($webhookUrl, [
            'embeds' => [[
                'title' => '✨ New User Registration',
                'description' => "Welcome **{$user->nama_lengkap}** to the Absensi APP!",
                'color' => 5793266,
                'fields' => [
                    ['name' => '👤 Full Name', 'value' => $user->nama_lengkap, 'inline' => false],
                    ['name' => '🧩 User Name', 'value' => $user->name, 'inline' => false],
                    ['name' => '📧 Email Address', 'value' => "`{$user->email}`", 'inline' => false],
                    ['name' => '🆔 User ID', 'value' => "`{$user->id}`", 'inline' => true],
                    ['name' => '📊 Status', 'value' => '🟢 Active', 'inline' => true],
                    ['name' => '📅 Registered At', 'value' => now()->format('F j, Y - g:i A'), 'inline' => false],
                ],
                'footer' => ['text' => 'User Management System'],
                'timestamp' => now()->toIso8601String(),
            ]],
        ]);
    }

    private function serialize(TempUsers $record): array
    {
        $data = $record->data ?? [];

        return [
            'id' => $record->id,
            'image' => isset($data['image']) ? "https://absensi-sac.sac-po.com/public/storage/user/{$data['image']}" : null,
            'nama_lengkap' => $data['nama_lengkap'] ?? '-',
            'pw' => $data['pw'] ?? '-',
            'no_hp' => $data['no_hp'] ?? '-',
            'email' => $data['email'] ?? '-',
            'status' => (bool) $record->status,
            'created_at' => $record->created_at?->format('d-m-Y H:i'),
        ];
    }
}
