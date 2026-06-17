<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::with('roles')
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user) => $this->serialize($user));

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Users/Form', [
            'userModel' => null,
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->payload($request);
        $roles = $data['roles'] ?? [];
        unset($data['roles']);

        if (blank($data['email_verified_at'] ?? null)) {
            $data['email_verified_at'] = null;
        }

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create($data);
        $user->syncRoles($roles);

        return redirect()->route('admin.users.index')->with('success', 'User berhasil dibuat.');
    }

    public function edit(User $user): Response
    {
        $user->load('roles');

        return Inertia::render('Users/Form', [
            'userModel' => $this->serialize($user),
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $this->payload($request, $user);
        $roles = $data['roles'] ?? [];
        unset($data['roles']);

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        if (blank($data['email_verified_at'] ?? null)) {
            $data['email_verified_at'] = null;
        }

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);
        $user->syncRoles($roles);

        return redirect()->route('admin.users.index')->with('success', 'User berhasil diupdate.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return back()->with('warning', 'User berhasil dihapus.');
    }

    public function bulkDelete(Request $request): RedirectResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array']])['ids'];
        User::whereIn('id', $ids)->delete();

        return back()->with('warning', 'User terpilih berhasil dihapus.');
    }

    private function payload(Request $request, ?User $user = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user?->id)],
            'password' => [$user ? 'nullable' : 'required', 'string', 'max:255'],
            'email_verified_at' => ['nullable', 'date'],
            'avatar' => ['nullable', 'image', 'max:2048'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);
    }

    private function serialize(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'roles' => $user->roles->pluck('name')->values(),
            'email_verified_at' => $user->email_verified_at?->format('Y-m-d\TH:i'),
            'created_at' => $user->created_at?->toDateTimeString(),
        ];
    }
}
