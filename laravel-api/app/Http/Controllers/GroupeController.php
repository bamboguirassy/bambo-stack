<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Groupe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GroupeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $groupes = Groupe::paginate(10);
        return ApiResponse::success($groupes);
    }

    public function all()
    {
       // $groupes = Groupe::all();
        $groupes = Groupe::select('id', 'nom')->get();
        return ApiResponse::success($groupes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // validate the request : nom,code,description,enabled,permissions
        $validators = validator($request->all(), [
            'nom' => 'required|unique:groupes,nom',
            'code' => 'required|unique:groupes,code',
            'description' => 'nullable',
            'permissions' => 'required|array',
            'permissions.*' => 'string|distinct'
        ]);
        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }
        try {
            $groupe = new Groupe($request->all());
            $groupe->saveOrFail();
            return ApiResponse::success($groupe, 'Groupe créé avec succès');
        } catch (\Throwable $exception) {
            return ApiResponse::throwException($exception);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Groupe $groupe)
    {
        // make permissions visible
        $groupe->makeVisible('permissions');
        return ApiResponse::success($groupe);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Groupe $groupe)
    {
        // validate the request : nom,code,description,enabled,permissions
        $validators = validator($request->all(), [
            'nom' => 'required|unique:groupes,nom,' . $groupe->id,
            'code' => 'required|unique:groupes,code,' . $groupe->id,
            'description' => 'nullable',
            'permissions' => 'required|array',
            'permissions.*' => 'string|distinct'
        ]);
        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }
        try {
            $groupe->fill($request->all());
            $groupe->saveOrFail();
            return ApiResponse::success($groupe, 'Groupe modifié avec succès');
        } catch (\Throwable $exception) {
            return ApiResponse::throwException($exception);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Groupe $groupe)
    {
        try {
            $groupe->delete();
            return ApiResponse::success([], 'Groupe supprimé avec succès');
        } catch (\Throwable $exception) {
            return ApiResponse::throwException($exception);
        }
    }

    /**
     * Enable the specified resource.
     */
    public function enable(Groupe $groupe)
    {
        try {
            $groupe->enabled = true;
            $groupe->saveOrFail();
            return ApiResponse::success($groupe, 'Groupe activé avec succès');
        } catch (\Throwable $exception) {
            return ApiResponse::throwException($exception);
        }
    }

    /**
     * Disable the specified resource.
     */
    public function disable(Groupe $groupe)
    {
        try {
            $groupe->enabled = false;
            $groupe->saveOrFail();
            return ApiResponse::success($groupe, 'Groupe désactivé avec succès');
        } catch (\Throwable $exception) {
            return ApiResponse::throwException($exception);
        }
    }

    /**
     * Get the permissions from the storage.
     */
    public function getPermissions()
    {
        // Chemin relatif au fichier dans le système de fichiers de storage
        $path = 'data/permissions.json';

        // Vérifie si le fichier existe
        if (Storage::disk('database')->exists($path)) {
            // Récupère le contenu du fichier
            $content = Storage::disk('database')->get($path);
            // Convertit le contenu en tableau
            $data = json_decode($content, true);
            // Retourne le contenu en JSON
            return ApiResponse::success($data);
        } else {
            return ApiResponse::error('Fichier de permissions introuvable', 404);
        }
    }
}
