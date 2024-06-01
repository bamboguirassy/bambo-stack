<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Objectif;
use App\Models\Organisation;
use App\Models\PieceJointe;
use App\Models\User;
use Illuminate\Http\Request;

class PieceJointeController extends Controller
{
    /**
     * Display a listing of the resource from a specific parentable.
     */
    public function findByParent($parentType, $parentId)
    {
        $validators = validator(['parentId' => $parentId, 'parentType' => $parentType], [
            'parentType' => 'required|string|in:objectif,organisation,user',
            'parentId' => 'required|integer',
        ]);
        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }
        if ($parentType === 'objectif') {
            $pieceJointes = PieceJointe::where('parentable_type', 'App\Models\Objectif')
                ->where('parentable_id', $parentId)
                ->get();
        } else if ($parentType === 'organisation') {
            $pieceJointes = PieceJointe::where('parentable_type', 'App\Models\Oranisation')
                ->where('parentable_id', $parentId)
                ->get();
        } else {
            $pieceJointes = PieceJointe::where('parentable_type', 'App\Models\User')
                ->where('parentable_id', $parentId)
                ->get();
        }

        return ApiResponse::success($pieceJointes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validators = validator($request->all(), [
            'piece' => 'required|file',
            'nom' => 'required|string',
            'type' => 'required|string|in:user',
            'parent_id' => 'required|integer',
        ]);
        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }

        $parentable_type = null;
        $parentable_type = User::class;

        // verifier que le nom est unique pour un parentable
        $pieceJointe = PieceJointe::where('nom', $request->nom)
            ->where('parentable_id', $request->parent_id)
            ->where('parentable_type', $parentable_type)
            ->first();
        if ($pieceJointe) {
            return ApiResponse::error('Un fichier avec le même nom existe déjà pour cet enregistrement. Veuillez renommer le fichier et réessayer.');
        }

        $pieceJointe = new PieceJointe();
        $pieceJointe->parentable_id = $request->parent_id;
        $pieceJointe->parentable_type = $parentable_type;
        $pieceJointe->path = $request->file('piece')->store('uploads/piece_jointes');
        $pieceJointe->nom = $request->nom;
        $pieceJointe->extension = $request->file('piece')->extension();
        $pieceJointe->saveOrFail();
        return ApiResponse::success($pieceJointe);
    }

    /**
     * Update the nom attribut of specified resource in storage.
     */
    public function update(Request $request, PieceJointe $pieceJointe)
    {
        $validators = validator($request->all(), [
            'nom' => 'required|string',
        ]);
        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }

        $pieceJointe->nom = $request->nom;
        $pieceJointe->saveOrFail();
        return ApiResponse::success($pieceJointe);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PieceJointe $pieceJointe)
    {
        $pieceJointe->deleteOrFail();
        return ApiResponse::success($pieceJointe);
    }
}
