<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PieceJointe extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $appends = ['full_path'];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($pieceJointe) {
            $pieceJointe->uid = (string) \Illuminate\Support\Str::uuid();
            $pieceJointe->created_by = auth()->id();
        });

        static::updating(function ($pieceJointe) {
            $pieceJointe->updated_by = auth()->id();
        });

        static::deleted(function ($pieceJointe) {
            // supprimer le fichier du disque
            \Illuminate\Support\Facades\Storage::delete($pieceJointe->path);
        });
    }

    public function parentable()
    {
        return $this->morphTo();
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getFullPathAttribute()
    {
        return asset($this->path);
    }
}
