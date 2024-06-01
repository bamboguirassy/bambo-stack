<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Groupe extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'permissions' => 'array'
    ];

    protected $hidden = [
        'created_by',
        'permissions',
    ];

    protected $withCount = ['users'];

    protected $appends = ['permissions_count'];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($groupe) {
            $groupe->created_by = auth()->id();
            $groupe->enabled = true;
            $groupe->uid = Str::uuid();
        });
    }

    /**
     * Get all of the userGroupes for the Groupe
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function userGroupes(): HasMany
    {
        return $this->hasMany(UserGroupe::class);
    }

    /**
     * The users that belong to the Groupe
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_groupes');
    }

    /**
     * permissions array count 
     */
    public function getPermissionsCountAttribute()
    {
        if (!isset($this->permissions)) {
            return 0;
        }
        return count($this->permissions);
    }
}
