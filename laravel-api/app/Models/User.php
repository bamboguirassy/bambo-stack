<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Notifications\AccountEmailVerificationNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $guarded = ['id'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'updated_at',
        'created_by',
        'disabled_at',
        'disabled_reason',
        'disabled_by',
        'updated_by',
    ];

    protected $appends = ['avatar'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->created_by = auth()->id();
            $model->uid = Str::uuid();
        });

        static::deleting(function ($user) {
            $user->oneTimePasswords()->delete();
            $user->userGroupes()->delete();
            $user->userOrganisations->each->delete();
            // rechercher tous les resets tokens associés au mail de l'utilisateur
            $emailVerifyTokens = EmailVerifyToken::where('email', $user->email)->get();
            $emailVerifyTokens->each(function ($emailVerifyToken) {
                $emailVerifyToken->delete();
            });
        });
    }

    /**
     * Get all of the oneTimePasswords for the User
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function oneTimePasswords(): HasMany
    {
        return $this->hasMany(OneTimePassword::class);
    }

    /**
     * Get all of the userGroupes for the User
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function userGroupes(): HasMany
    {
        return $this->hasMany(UserGroupe::class);
    }

    /**
     * The groupes that belong to the User
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function groupes(): BelongsToMany
    {
        return $this->belongsToMany(Groupe::class, 'user_groupes');
    }

    /**
     * Get permissions for the user (fusionner les permissions des groupes de l'utilisateur)
     */
    public function getPermissionsAttribute()
    {
        $permissions = [];
        foreach ($this->groupes()->get() as $groupe) {
            $permissions = array_merge($permissions, $groupe->permissions);
        }
        return $permissions;
    }

    /**
     * Get user avatar with online avatar generator
     */
    public function getAvatarAttribute()
    {
        return 'https://eu.ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=random';
        // return 'https://eu.ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=D9363E&color=fff';
    }

    public function generateAndSendEmailVerificationToken()
    {
        // verifier s'il existe un token 
        $emailVerifyToken = EmailVerifyToken::where('email', $this->email)->first();
        if (!$emailVerifyToken) {
            // generate a password reset token
            $emailVerifyToken = new EmailVerifyToken(['email' => $this->email]);
            $emailVerifyToken->token = Str::random(60);
            $emailVerifyToken->saveOrFail();
        }
        // send email verification email to the user with an url to verify his email
        $this->notify(new AccountEmailVerificationNotification($emailVerifyToken));
    }

    /**
     * Get all pieces jointes related to the user : morphMany relation to PieceJointe
     */
    public function pieceJointes()
    {
        return $this->morphMany(PieceJointe::class, 'parentable');
    }
}
