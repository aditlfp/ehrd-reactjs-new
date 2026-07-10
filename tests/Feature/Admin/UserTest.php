<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('super_admin');
        return $user;
    }

    private function nonAdmin(): User
    {
        return User::factory()->create();
    }

    // ── Access Control ────────────────────────────────────────────────────────

    public function test_guest_cannot_access_users_index(): void
    {
        $this->get('/admin/users')->assertRedirect('/login');
    }

    public function test_non_admin_gets_403_on_users_index(): void
    {
        $this->actingAs($this->nonAdmin())
            ->get('/admin/users')
            ->assertStatus(403);
    }

    public function test_admin_can_access_users_index(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/users')
            ->assertStatus(200);
    }

    // ── Index / Search ────────────────────────────────────────────────────────

    public function test_users_index_returns_paginated_list(): void
    {
        User::factory()->count(3)->create();

        $this->actingAs($this->admin())
            ->get('/admin/users')
            ->assertStatus(200);
    }

    public function test_users_index_search_by_name(): void
    {
        User::factory()->create(['name' => 'FindMe']);
        User::factory()->create(['name' => 'HideMe']);

        $this->actingAs($this->admin())
            ->get('/admin/users?search=FindMe')
            ->assertStatus(200);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public function test_admin_can_access_create_user_page(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/users/create')
            ->assertStatus(200);
    }

    // ── Store ─────────────────────────────────────────────────────────────────

    public function test_admin_can_create_user(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/users', [
                'name'     => 'newuser',
                'email'    => 'newuser@example.com',
                'password' => 'secret123',
                'roles'    => [],
            ])
            ->assertRedirect('/admin/users');

        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    }

    public function test_store_user_requires_name(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/users', [
                'email'    => 'x@example.com',
                'password' => 'secret123',
            ])
            ->assertSessionHasErrors('name');
    }

    public function test_store_user_requires_unique_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->actingAs($this->admin())
            ->post('/admin/users', [
                'name'     => 'someone',
                'email'    => 'taken@example.com',
                'password' => 'secret123',
            ])
            ->assertSessionHasErrors('email');
    }

    public function test_store_user_requires_password_for_new_user(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/users', [
                'name'  => 'nopass',
                'email' => 'nopass@example.com',
            ])
            ->assertSessionHasErrors('password');
    }

    public function test_store_assigns_roles(): void
    {
        Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);

        $this->actingAs($this->admin())
            ->post('/admin/users', [
                'name'     => 'roleuser',
                'email'    => 'roleuser@example.com',
                'password' => 'secret123',
                'roles'    => ['super_admin'],
            ])
            ->assertRedirect('/admin/users');

        $created = User::where('email', 'roleuser@example.com')->first();
        $this->assertTrue($created->hasRole('super_admin'));
    }

    // ── Edit ─────────────────────────────────────────────────────────────────

    public function test_admin_can_access_edit_user_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($this->admin())
            ->get("/admin/users/{$user->id}/edit")
            ->assertStatus(200);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function test_admin_can_update_user(): void
    {
        $user = User::factory()->create(['name' => 'OldName']);

        $this->actingAs($this->admin())
            ->put("/admin/users/{$user->id}", [
                'name'  => 'UpdatedName',
                'email' => $user->email,
                'roles' => [],
            ])
            ->assertRedirect('/admin/users');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'UpdatedName']);
    }

    public function test_update_allows_same_email_for_same_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($this->admin())
            ->put("/admin/users/{$user->id}", [
                'name'  => $user->name,
                'email' => $user->email,
                'roles' => [],
            ])
            ->assertRedirect('/admin/users');
    }

    public function test_update_does_not_require_password(): void
    {
        $user = User::factory()->create();

        $this->actingAs($this->admin())
            ->put("/admin/users/{$user->id}", [
                'name'  => $user->name,
                'email' => $user->email,
                'roles' => [],
            ])
            ->assertRedirect('/admin/users');
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function test_admin_can_delete_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($this->admin())
            ->delete("/admin/users/{$user->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    // ── Bulk Delete ───────────────────────────────────────────────────────────

    public function test_admin_can_bulk_delete_users(): void
    {
        $users = User::factory()->count(3)->create();
        $ids   = $users->pluck('id')->toArray();

        $this->actingAs($this->admin())
            ->post('/admin/users/bulk-delete', ['ids' => $ids])
            ->assertRedirect();

        foreach ($ids as $id) {
            $this->assertDatabaseMissing('users', ['id' => $id]);
        }
    }

    public function test_bulk_delete_requires_ids(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/users/bulk-delete', [])
            ->assertSessionHasErrors('ids');
    }
}
