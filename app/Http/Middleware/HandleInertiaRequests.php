<?php

namespace App\Http\Middleware;

use App\Models\PGJ_Kontrak;
use App\Models\TempUsers;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                ] : null,
                'roles' => $user?->getRoleNames() ?? [],
                'permissions' => $user?->getAllPermissions()->pluck('name') ?? [],
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'badges' => fn () => $user ? [
                'expiredContracts' => PGJ_Kontrak::where('tgl_selesai_kontrak', '<', now())->count(),
                'pendingTempUsers' => TempUsers::where('status', 0)->count(),
            ] : [
                'expiredContracts' => 0,
                'pendingTempUsers' => 0,
            ],
        ];
    }
}
