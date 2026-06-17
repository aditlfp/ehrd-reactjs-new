<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employe;
use App\Models\PGJ_Kontrak;
use App\Models\TempUsers;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $monthly = Employe::query()
            ->selectRaw('MONTH(created_at) as month, COUNT(*) as total')
            ->whereYear('created_at', now()->year)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->pluck('total', 'month');

        $chart = collect(range(1, 12))->map(fn (int $month) => [
            'month' => Carbon::create(null, $month, 1)->format('M'),
            'count' => (int) ($monthly[$month] ?? 0),
        ])->values();

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'employes' => Employe::count(),
                'contracts' => PGJ_Kontrak::withTrashed()->count(),
                'pendingTempUsers' => TempUsers::where('status', 0)->count(),
                'users' => User::count(),
            ],
            'chart' => $chart,
        ]);
    }
}
