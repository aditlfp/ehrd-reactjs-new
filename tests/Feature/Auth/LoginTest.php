<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_is_accessible_to_guests(): void
    {
        $this->get('/login')->assertStatus(200);
    }

    public function test_authenticated_user_redirected_from_login(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super_admin');

        $this->actingAs($user)->get('/login')->assertRedirect();
    }

    public function test_user_can_login_with_email(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);
        $user->assignRole('super_admin');

        $this->post('/login', [
            'login' => 'admin@example.com',
            'password' => 'password',
        ])->assertRedirect('/admin');

        $this->assertAuthenticatedAs($user);
    }

    public function test_user_can_login_with_username(): void
    {
        $user = User::factory()->create([
            'name' => 'adminuser',
            'password' => bcrypt('password'),
        ]);
        $user->assignRole('super_admin');

        $this->post('/login', [
            'login' => 'adminuser',
            'password' => 'password',
        ])->assertRedirect('/admin');
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'admin@example.com']);

        $this->post('/login', [
            'login' => 'admin@example.com',
            'password' => 'wrongpassword',
        ])->assertSessionHasErrors('login');

        $this->assertGuest();
    }

    public function test_login_fails_without_admin_role(): void
    {
        $user = User::factory()->create([
            'email' => 'nonadmin@example.com',
            'password' => bcrypt('password'),
        ]);
        // no role assigned

        $this->post('/login', [
            'login' => 'nonadmin@example.com',
            'password' => 'password',
        ])->assertSessionHasErrors('login');

        $this->assertGuest();
    }

    public function test_superadmin_email_can_login_without_role(): void
    {
        User::factory()->create([
            'email' => 'superadmin@gmail.com',
            'password' => bcrypt('password'),
        ]);

        $this->post('/login', [
            'login' => 'superadmin@gmail.com',
            'password' => 'password',
        ])->assertRedirect('/admin');
    }

    public function test_login_requires_login_field(): void
    {
        $this->post('/login', ['password' => 'password'])
            ->assertSessionHasErrors('login');
    }

    public function test_login_requires_password_field(): void
    {
        $this->post('/login', ['login' => 'someone'])
            ->assertSessionHasErrors('password');
    }

    public function test_logout_redirects_to_login(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super_admin');

        $this->actingAs($user)
            ->post('/logout')
            ->assertRedirect('/login');

        $this->assertGuest();
    }
}
