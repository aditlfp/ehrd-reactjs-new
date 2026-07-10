<?php

require_once __DIR__ . '/../vendor/autoload.php';

// Ensure external sqlite test DB files exist before Laravel boots connections
$dbDir = __DIR__ . '/../database';
foreach (['testing_edata.sqlite', 'testing_mysql2.sqlite'] as $file) {
    $path = $dbDir . '/' . $file;
    if (! file_exists($path)) {
        touch($path);
    }
}
