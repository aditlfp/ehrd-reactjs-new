<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\TempUsers;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class TempUsersTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('super_admin');
        return $user;
    }

    private function makeTempUser(array $data = []): TempUsers
    {
        return TempUsers::create([
            'data' => array_merge([
                'nama_lengkap' => 'John Doe',
                'email'        => 'john@example.com',
                'no_hp'        => '08123456789',
                'username'     => 'johndoe',
                'password'     => bcrypt('secret'),
                'nik'          => '1234567890123456',
            ], $data),
            'status' => false,
        ]);
    }

    // ── Access Control ────────────────────────────────────────────────────────

    public function test_guest_cannot_access_temp_users(): void
    {
        $this->get('/admin/temp-users')->assertRedirect('/login');
    }

    public function test_non_admin_gets_403(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->get('/admin/temp-users')->assertStatus(403);
    }

    public function test_admin_can_access_temp_users_index(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/temp-users')
            ->assertStatus(200);
    }

    // ── Index / Search ────────────────────────────────────────────────────────

    public function test_temp_users_index_loads_without_records(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/temp-users')
            ->assertStatus(200);
    }

    public function test_temp_users_search_filter_accepted(): void
    {
        $this->makeTempUser(['nama_lengkap' => 'john smith']);

        $this->actingAs($this->admin())
            ->get('/admin/temp-users?search=john')
            ->assertStatus(200);
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function test_admin_can_delete_temp_user(): void
    {
        $record = $this->makeTempUser();

        $this->actingAs($this->admin())
            ->delete("/admin/temp-users/{$record->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('temp_users', ['id' => $record->id], 'mysql2connection');
    }

    // ── Bulk Delete ───────────────────────────────────────────────────────────

    public function test_bulk_delete_requires_ids(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/temp-users/bulk-delete', [])
            ->assertSessionHasErrors('ids');
    }

    public function test_bulk_delete_requires_array(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/temp-users/bulk-delete', ['ids' => 'not-an-array'])
            ->assertSessionHasErrors('ids');
    }

    public function test_admin_can_bulk_delete_temp_users(): void
    {
        $records = collect([
            $this->makeTempUser(['email' => 'a@example.com', 'username' => 'usera']),
            $this->makeTempUser(['email' => 'b@example.com', 'username' => 'userb']),
        ]);

        $ids = $records->pluck('id')->toArray();

        $this->actingAs($this->admin())
            ->post('/admin/temp-users/bulk-delete', ['ids' => $ids])
            ->assertRedirect();

        foreach ($ids as $id) {
            $this->assertDatabaseMissing('temp_users', ['id' => $id], 'mysql2connection');
        }
    }
}
