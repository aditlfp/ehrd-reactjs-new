<?php

namespace Tests\Unit;

use App\Models\Employe;
use PHPUnit\Framework\TestCase;

class EmployeModelTest extends TestCase
{
    public function test_no_induk_karyawan_returns_null_when_fields_missing(): void
    {
        $employe = new Employe();
        $this->assertNull($employe->getNoIndukKaryawanAttribute());
    }

    public function test_no_induk_karyawan_computed_correctly(): void
    {
        $employe = new Employe();
        $employe->initials = 'AB';
        $employe->numbers  = '5';
        $employe->date_real = '2023-01-15';

        // AB + 005 + 230115
        $this->assertEquals('AB005230115', $employe->getNoIndukKaryawanAttribute());
    }

    public function test_img_attribute_prepends_images_prefix(): void
    {
        $employe = new Employe();
        // Directly call the accessor with a raw value (no DB needed)
        $result = $employe->getImgAttribute('photo.jpg');
        $this->assertEquals('images/photo.jpg', $result);
    }

    public function test_img_attribute_does_not_double_prefix(): void
    {
        $employe = new Employe();
        $result = $employe->getImgAttribute('images/photo.jpg');
        $this->assertEquals('images/photo.jpg', $result);
    }

    public function test_img_attribute_returns_null_when_empty(): void
    {
        $employe = new Employe();
        $this->assertNull($employe->getImgAttribute(null));
    }

    public function test_decrypt_value_returns_plain_when_not_encrypted(): void
    {
        $employe = new Employe();
        // getNoKkAttribute falls back to raw value if decryption fails
        $result = $employe->getNoKkAttribute('plain-value');
        $this->assertEquals('plain-value', $result);
    }
}
