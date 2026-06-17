<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EmployeController;
use App\Http\Controllers\Admin\PGJKontrakController;
use App\Http\Controllers\Admin\TempUsersController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/admin');

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

Route::middleware(['auth', 'admin.access'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::get('/employes/pdf', [EmployeController::class, 'pdf'])->name('employes.pdf');
    Route::get('/employes/client-meta', [EmployeController::class, 'clientMeta'])->name('employes.client-meta');
    Route::post('/employes/bulk-delete', [EmployeController::class, 'bulkDelete'])->name('employes.bulk-delete');
    Route::resource('employes', EmployeController::class)->except(['show']);

    Route::get('/pengajuan-kontrak/options', [PGJKontrakController::class, 'options'])->name('pengajuan-kontrak.options');
    Route::get('/pengajuan-kontrak/{pengajuan_kontrak}/pdf', [PGJKontrakController::class, 'pdf'])->name('pengajuan-kontrak.pdf');
    Route::get('/pengajuan-kontrak/{pengajuan_kontrak}/preview', [PGJKontrakController::class, 'preview'])->name('pengajuan-kontrak.preview');
    Route::post('/pengajuan-kontrak/{pengajuan_kontrak}/send-to-operator', [PGJKontrakController::class, 'sendToOperator'])->name('pengajuan-kontrak.send-to-operator');
    Route::post('/pengajuan-kontrak/{id}/restore', [PGJKontrakController::class, 'restore'])->name('pengajuan-kontrak.restore');
    Route::delete('/pengajuan-kontrak/{id}/force-delete', [PGJKontrakController::class, 'forceDelete'])->name('pengajuan-kontrak.force-delete');
    Route::resource('pengajuan-kontrak', PGJKontrakController::class)->parameters(['pengajuan-kontrak' => 'pengajuan_kontrak']);

    Route::post('/temp-users/bulk-delete', [TempUsersController::class, 'bulkDelete'])->name('temp-users.bulk-delete');
    Route::post('/temp-users/{temp_user}/verify', [TempUsersController::class, 'verify'])->name('temp-users.verify');
    Route::resource('temp-users', TempUsersController::class)->only(['index', 'destroy'])->parameters(['temp-users' => 'temp_user']);

    Route::post('/users/bulk-delete', [UserController::class, 'bulkDelete'])->name('users.bulk-delete');
    Route::resource('users', UserController::class)->except(['show']);
});
