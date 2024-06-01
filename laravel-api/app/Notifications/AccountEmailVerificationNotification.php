<?php

namespace App\Notifications;

use App\Models\EmailVerifyToken;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountEmailVerificationNotification extends Notification
{
    use Queueable;
    public EmailVerifyToken $emailVerifyToken;
    public String $verificationUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct(EmailVerifyToken $emailVerifyToken)
    {
        $this->emailVerifyToken = $emailVerifyToken;
        $this->verificationUrl = config('app.frontend_url') . '/verify-email/' . $emailVerifyToken->token;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->markdown('notifications.account-email-verification-notification', [
                'emailVerifyToken' => $this->emailVerifyToken,
                'verificationUrl' => $this->verificationUrl
            ])
            ->subject('Vérification de votre adresse email');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
