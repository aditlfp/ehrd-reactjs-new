<?php

namespace Tests;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

trait CreatesExternalTables
{
    protected function createMysql2Tables(): void
    {
        if (! Schema::connection('mysql2connection')->hasTable('clients')) {
            Schema::connection('mysql2connection')->create('clients', function (Blueprint $t) {
                $t->id();
                $t->string('name');
                $t->string('panggilan')->nullable();
                $t->string('address')->nullable();
                $t->string('province')->nullable();
                $t->string('kabupaten')->nullable();
                $t->string('zipcode')->nullable();
                $t->string('email')->nullable();
                $t->string('phone')->nullable();
                $t->string('fax')->nullable();
                $t->string('logo')->nullable();
                $t->timestamps();
            });
        }

        if (! Schema::connection('mysql2connection')->hasTable('kerjasamas')) {
            Schema::connection('mysql2connection')->create('kerjasamas', function (Blueprint $t) {
                $t->id();
                $t->unsignedBigInteger('client_id')->nullable();
                $t->string('value')->nullable();
                $t->date('experied')->nullable();
                $t->string('approve1')->nullable();
                $t->string('approve2')->nullable();
                $t->string('approve3')->nullable();
                $t->timestamps();
            });
        }

        if (! Schema::connection('mysql2connection')->hasTable('jabatans')) {
            Schema::connection('mysql2connection')->create('jabatans', function (Blueprint $t) {
                $t->id();
                $t->unsignedBigInteger('divisi_id')->nullable();
                $t->string('code_jabatan')->nullable();
                $t->string('type_jabatan')->nullable();
                $t->string('name_jabatan')->nullable();
                $t->unsignedBigInteger('kerjasama_id')->nullable();
                $t->timestamps();
            });
        }

        if (! Schema::connection('mysql2connection')->hasTable('divisis')) {
            Schema::connection('mysql2connection')->create('divisis', function (Blueprint $t) {
                $t->id();
                $t->string('name')->nullable();
                $t->unsignedBigInteger('jabatan_id')->nullable();
                $t->timestamps();
            });
        }

        if (! Schema::connection('mysql2connection')->hasTable('user_absensi')) {
            Schema::connection('mysql2connection')->create('user_absensi', function (Blueprint $t) {
                $t->id();
                $t->string('name')->nullable();
                $t->string('nama_lengkap')->nullable();
                $t->string('email')->nullable();
                $t->string('password')->nullable();
                $t->string('image')->nullable();
                $t->unsignedBigInteger('devisi_id')->nullable();
                $t->unsignedBigInteger('jabatan_id')->nullable();
                $t->unsignedBigInteger('kerjasama_id')->nullable();
                $t->unsignedBigInteger('status_id')->nullable();
                $t->string('nik')->nullable();
                $t->string('no_hp')->nullable();
                $t->timestamps();
            });
        }

        if (! Schema::connection('mysql2connection')->hasTable('temp_users')) {
            Schema::connection('mysql2connection')->create('temp_users', function (Blueprint $t) {
                $t->id();
                $t->json('data')->nullable();
                $t->boolean('status')->default(false);
                $t->timestamps();
            });
        }
    }

    protected function createEdataTables(): void
    {
        if (! Schema::connection('mysqlEdata')->hasTable('employes')) {
            Schema::connection('mysqlEdata')->create('employes', function (Blueprint $t) {
                $t->id();
                $t->unsignedBigInteger('user_id')->nullable();
                $t->string('name')->nullable();
                $t->string('ttl')->nullable();
                $t->text('alamat')->nullable();
                $t->string('nik')->nullable();
                $t->text('no_kk')->nullable();
                $t->text('no_ktp')->nullable();
                $t->unsignedBigInteger('client_id')->nullable();
                $t->string('img')->nullable();
                $t->string('img_ktp_dpn')->nullable();
                $t->string('img_ktp_bkg')->nullable();
                $t->json('jenis_bpjs')->nullable();
                $t->string('no_bpjs_kesehatan')->nullable();
                $t->string('file_bpjs_kesehatan')->nullable();
                $t->string('no_bpjs_ketenaga')->nullable();
                $t->string('file_bpjs_ketenaga')->nullable();
                $t->string('numbers')->nullable();
                $t->string('initials')->nullable();
                $t->date('date_real')->nullable();
                $t->timestamps();
            });
        }

        if (! Schema::connection('mysqlEdata')->hasTable('p_g_j__kontraks')) {
            Schema::connection('mysqlEdata')->create('p_g_j__kontraks', function (Blueprint $t) {
                $t->id();
                $t->string('no_srt')->nullable();
                $t->boolean('send_to_operator')->default(false);
                $t->boolean('send_to_atasan')->default(false);
                $t->string('ttd_atasan')->nullable();
                $t->date('tgl_dibuat')->nullable();
                $t->string('nama_pk_ptm')->nullable();
                $t->string('alamat_pk_ptm')->nullable();
                $t->string('jabatan_pk_ptm')->nullable();
                $t->string('nama_pk_kda')->nullable();
                $t->string('tempat_lahir_pk_kda')->nullable();
                $t->date('tgl_lahir_pk_kda')->nullable();
                $t->text('nik_pk_kda')->nullable();
                $t->text('alamat_pk_kda')->nullable();
                $t->string('jabatan_pk_kda')->nullable();
                $t->string('status_pk_kda')->nullable();
                $t->string('unit_pk_kda')->nullable();
                $t->date('tgl_mulai_kontrak')->nullable();
                $t->date('tgl_selesai_kontrak')->nullable();
                $t->decimal('g_pok', 15, 2)->nullable();
                $t->decimal('tj_hadir', 15, 2)->nullable();
                $t->decimal('kinerja', 15, 2)->nullable();
                $t->decimal('lain_lain', 15, 2)->nullable();
                $t->string('ttd')->nullable();
                $t->timestamps();
                $t->softDeletes();
            });
        }
    }

    protected function dropExternalTables(): void
    {
        foreach (['temp_users', 'user_absensi', 'divisis', 'jabatans', 'kerjasamas', 'clients'] as $table) {
            Schema::connection('mysql2connection')->dropIfExists($table);
        }
        foreach (['employes', 'p_g_j__kontraks'] as $table) {
            Schema::connection('mysqlEdata')->dropIfExists($table);
        }
    }
}
