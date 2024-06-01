<?php

namespace App\Providers;

use App\Helpers\ApiResponse;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        RateLimiter::for('api', function (Request $request) {
            return Limit::perSecond(config('app.rate_limit_per_second'))->by($request->user()?->uid ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return ApiResponse::error('L\'utilisateur a envoyé trop de requêtes dans un court laps de temps',429);
                });
        });
    }
}
