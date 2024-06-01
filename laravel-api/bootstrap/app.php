<?php
use App\Http\Middleware\RecordLastActivityMiddleware;
use App\Http\Middleware\CheckIfUserEnabled;
use App\Http\Middleware\CheckPermission;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\Auth;
use Sentry\Laravel\Integration;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias(['check.user.enabled' => CheckIfUserEnabled::class]);
    })
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias(['check' => CheckPermission::class]);
    })
    ->withMiddleware(function (Middleware $middleware) {  
        $middleware->append(RecordLastActivityMiddleware::class);
   })
    ->withExceptions(function (Exceptions $exceptions) {
        Integration::handles($exceptions);
    })->create();
