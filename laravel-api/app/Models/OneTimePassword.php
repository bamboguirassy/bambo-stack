<?php

namespace App\Models;

use App\Notifications\SendOneTimePasswordToUserEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class OneTimePassword extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($oneTimePassword) {
            $oneTimePassword->uid = (string) Str::uuid();
            $oneTimePassword->otp = random_int(100000, 999999);
            if(!isset($oneTimePassword->expires_at)) {
                $oneTimePassword->expires_at = now()->addHours(2);
            }
        });

        static::created(function ($oneTimePassword) {
            $oneTimePassword->user->notify(new SendOneTimePasswordToUserEmail($oneTimePassword));
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
