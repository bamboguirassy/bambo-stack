<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Groupe;
use App\Models\UserGroupe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserGroupeController extends Controller
{
    /**
     * Find by groupe
     */
    public function findByGroupe(Groupe $groupe)
    {
        $userGroupes = $groupe->userGroupes()->with('user')->paginate(10);
        return ApiResponse::success($userGroupes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    public function linkUsersToGroupe(Request $request, Groupe $groupe)
    {
        $validators = validator($request->all(), [
            'userIds'=>'required|array',
            'userIds.*' => 'exists:users,id'
        ]);
        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }
        try {
            DB::beginTransaction();
            $userIds = $request->userIds;
            $userGroupes = [];
            foreach ($userIds as $userId) {
                $userGroupes[] = [
                    'user_id' => $userId,
                    'groupe_id' => $groupe->id,
                ];
            }
            UserGroupe::insert($userGroupes);
            DB::commit();
            return ApiResponse::success($userGroupes, 'Les utilisateurs ont été ajoutés avec succès', 201);
        } catch (\Throwable $th) {
            DB::rollBack();
            return ApiResponse::throwException($th);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserGroupe $userGroupe)
    {
        $userGroupe->deleteOrFail();
        return ApiResponse::success($userGroupe, "Utilisateur retiré du groupe avec succès");
    }
}
