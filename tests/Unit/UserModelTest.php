<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_access_admin_via_superadmin_email(): void
    {
        $user = User::factory()->make(['email' => 'superadmin@gmail.com']);
        $this->assertTrue($user->canAccessAdmin());
    }

    public function test_cannot_access_admin_without_role_or_special_email(): void
    {
        $user = User::factory()->make(['email' => 'random@example.com']);
        $this->assertFalse($user->canAccessAdmin());
    }

    public function test_can_access_admin_via_super_admin_role(): void
    {
        $user = User::factory()->create(['email' => 'other@example.com']);
        $user->assignRole('super_admin');
        $this->assertTrue($user->canAccessAdmin());
    }

    public function test_password_is_hashed(): void
    {
        $user = User::factory()->create(['password' => bcrypt('secret')]);
        $this->assertNotEquals('secret', $user->password);
    }

    public function test_factory_creates_valid_user(): void
    {
        $user = User::factory()->create();
        $this->assertNotNull($user->id);
        $this->assertNotNull($user->email);
        $this->assertNotNull($user->name);
    }
}
