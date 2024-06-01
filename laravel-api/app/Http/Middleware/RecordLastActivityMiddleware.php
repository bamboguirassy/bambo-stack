<?php

namespace App\Http\Middleware;


use App\User;



use App\Http\Middleware\Auth;
use App\Http\Controllers;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RecordLastActivityMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->bearerToken()) {
            if(auth()->guard('sanctum')->user()) {
                auth()->guard('sanctum')->user()->update(['last_activity_at' => now()]);
            }
        }
        return $next($request);
    }
}
