<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::firstOrCreate(['name' => 'super_admin']);

        $user = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@gmail.com',
        ]);

        $user->assignRole($role);
    }
}
