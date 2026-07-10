<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

abstract class TestCase extends BaseTestCase
{
    use CreatesExternalTables;

    protected function setUp(): void
    {
        parent::setUp();

        // Override external connections to temp sqlite files — works locally + CI
        foreach ([
            'mysqlEdata'       => sys_get_temp_dir() . '/testing_edata.sqlite',
            'mysql2connection' => sys_get_temp_dir() . '/testing_mysql2.sqlite',
        ] as $connection => $path) {
            if (! file_exists($path)) {
                touch($path);
            }
            config(["database.connections.{$connection}.driver"   => 'sqlite']);
            config(["database.connections.{$connection}.database" => $path]);
            DB::purge($connection);
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $this->createMysql2Tables();
        $this->createEdataTables();
    }
}
