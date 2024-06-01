<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, String $permission): Response
    {
        // Vérifie si l'utilisateur est connecté et a la permission nécessaire
        if (auth()->check() && (in_array($permission, auth()->user()->permissions) || auth()->user()->is_admin)) {
            return $next($request);
        }

        // Si la permission n'est pas trouvée, retourner une erreur 403
        return ApiResponse::error('Vous n\'avez pas la permission nécessaire pour accéder à cette ressource', 403);
    }
}
