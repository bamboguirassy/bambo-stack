{{-- new-account-email-verification-notification.blade.php --}}
<x-mail::message>
# Bonjour et bienvenue sur {{ config('app.name') }} !

Un compte a été créé avec cette adresse e-mail sur {{ config('app.name') }}.  

Pour continuer, que ce soit pour un premier compte ou une réinitialisation de mot de passe, vous devez vérifier votre adresse e-mail en cliquant sur le bouton ci-dessous.

<x-mail::button :url="$verificationUrl">
Vérifier mon e-mail
</x-mail::button>

Si vous ne parvenez pas à cliquer sur le bouton, copiez et collez l'URL suivante dans votre navigateur :
[{{ $verificationUrl }}]({{ $verificationUrl }})

Si vous n'avez pas demandé cette action, merci d'ignorer cet e-mail.


Merci,<br>
{{ config('app.name') }}
</x-mail::message>
