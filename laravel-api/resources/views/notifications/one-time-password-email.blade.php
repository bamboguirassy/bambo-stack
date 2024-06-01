<x-mail::message>
# Mot de passe à usage unique

Vous avez demandé un code de vérification pour accéder à votre compte. 
Veuillez utiliser le code ci-dessous pour continuer. Notez que ce code doit expirer dans 2 heures.

@component('mail::panel')
Code de Vérification: {{ $otp }}
@endcomponent

Si vous n'avez pas demandé ce code, veuillez ignorer ce message.

Merci,<br>
{{ config('app.name') }}
</x-mail::message>
