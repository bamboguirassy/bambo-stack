<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

class GenerateUserCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:user';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Commande pour générer un nouvel utilisateur avec laravel prompt by Moussa FOFANA. par exemple: php artisan generate:user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = text('Entrez le nom complet du compte :', required: true ,validate: fn (string $value) => match (true) {
            strlen($value) < 3 => 'The name must be at least 3 characters.',
            strlen($value) > 255 => 'The name must not exceed 255 characters.',
            default => null
        });
        $email = text('Entrez l\'email du compte :', required: true);
        $password = text('Entrez le mot de passe du compte :', required: true);
        $enabled = confirm(
            label: 'Activer le compte ?',
            default: false,
            yes: 'Oui',
            no: 'Non',
            hint: 'Indiquer si le compte doit être activé ou non.'
        );
        // confirmer si l'utilisateur est un admin
        $isAdmin = confirm(
            label: 'Est-ce un compte administrateur ?',
            default: false,
            yes: 'Oui',
            no: 'Non',
            hint: 'Indiquer si le compte doit être un compte administrateur ou non.'
        );
        $this->info('Création de l\'utilisateur en cours ...');
        $user = \App\Models\User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'enabled' => $enabled,
            'is_admin' => $isAdmin,
        ]);
        $this->info('Utilisateur créé avec succès !'.$user->toJson());
    }
}
