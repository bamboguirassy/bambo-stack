<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckIfUserEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verifier si l'utilisateur connecté est actif
        if (auth()->user() && auth()->user()->enabled) {
            return $next($request);
        }
        // Si l'utilisateur n'est pas actif, retourner une erreur 403
        return ApiResponse::error('Utilisateur inactif !', 403);
    }
}
