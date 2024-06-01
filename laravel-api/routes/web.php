<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('test-email', function () {
    return new \App\Mail\TestEmail();
});
