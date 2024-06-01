<?php

namespace App\Notifications;

use App\Models\OneTimePassword;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendOneTimePasswordToUserEmail extends Notification
{
    use Queueable;
    public OneTimePassword $oneTimePassword;
    public $otp;

    /**
     * Create a new notification instance.
     */
    public function __construct(OneTimePassword $oneTimePassword)
    {
        $this->oneTimePassword = $oneTimePassword;
        $this->otp = $oneTimePassword->otp;
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
        return (new MailMessage)->markdown('notifications.one-time-password-email', ['otp' => $this->otp])
        ->subject('Code de connexion unique');
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
