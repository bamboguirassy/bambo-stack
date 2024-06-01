<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class HistoriqueConnexion extends Model
{
    protected $guarded = ['id'];
    use HasFactory;

    public static function boot()
    {
        parent::boot();

        static::creating(function ($historiqueConnexion) {
            $historiqueConnexion->uid = str::uuid();
        });
    }
}
