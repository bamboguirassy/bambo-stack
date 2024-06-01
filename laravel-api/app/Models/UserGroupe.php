<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGroupe extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function groupe()
    {
        return $this->belongsTo(Groupe::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
