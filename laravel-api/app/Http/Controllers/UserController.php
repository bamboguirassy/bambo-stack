<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\OneTimePassword;
use App\Models\EmailVerifyToken;
use App\Models\Groupe;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;
use App\Models\HistoriqueConnexion;
use App\Models\Organisation;


class UserController extends Controller
{
    /**
     * Search for a user
     */
    public function search(Request $request)
    {
        $validators = validator($request->all(), [
            'searchText' => 'nullable|string',
            'statut' => 'nullable|string|in:actif,inactif,tout',
            'groupeIds' => 'nullable|array',
            'groupeIds.*' => 'exists:groupes,id',
        ]);

        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }

        $queryBuilder = User::query();
        if ($request->searchText) {
            $queryBuilder->where(function ($query) use ($request) {
                $query->where('name', 'like', "%$request->searchText%")
                    ->orWhere('email', 'like', "%$request->searchText%");
            });
        }
        if ($request->statut) {
            if ($request->statut === 'actif') {
                $queryBuilder->where('enabled', true);
            } elseif ($request->statut === 'inactif') {
                $queryBuilder->where('enabled', false);
            }
        }
        if ($request->groupeIds) {
            $queryBuilder->whereHas('groupes', function ($query) use ($request) {
                $query->whereIn('groupes.id', $request->groupeIds);
            });
        }
        $users = $queryBuilder->paginate(10);
        $users->makeVisible('enabled');
        $users->load('groupes');
        return ApiResponse::success($users);
    }
    /**
     * Get the authenticated user
     * @creation: 12/05/2024
     * @author bamboguirassy <didegassama@gmail.com>
     */
    public function login(Request $request)
    {
        $validators = validator($request->only('email', 'password'), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }

        // trouver l'utilisateur correspondant au mail et verifier s'il est actif
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return ApiResponse::error('Identifiants de connexion invalides', 404);
        }
        if (!$user->enabled) {
            return ApiResponse::error('Utilisateur inactif', 401);
        }

        try {
            if (auth()->attempt($request->only('email', 'password'))) {
                DB::beginTransaction();
                $oneTimePassword = new OneTimePassword(['user_id' => $user->id]);
                $oneTimePassword->saveOrFail();
                $user->updateOrFail(['last_login_at' => now()]);

                $currentUserAgent = $request->header('User-Agent');
                $historiqueConnexion = HistoriqueConnexion::where('user_id', $user->id)
                ->where('user_agent', $currentUserAgent)
                ->exists();
                if(!$historiqueConnexion){
                    $historiqueConnexion = new HistoriqueConnexion();
                    $historiqueConnexion->user_id = $user->id;
                    $historiqueConnexion->user_agent = $currentUserAgent;
                    $historiqueConnexion->ip = $request->ip();
                    $historiqueConnexion->saveOrFail();
                }
                DB::commit();
                return ApiResponse::success(auth()->user(), "Un code de connexion a été envoyé à votre adresse email");
            }
        } catch (Throwable $exception) {
            DB::rollBack();
            return ApiResponse::throwException($exception);
        }

        return ApiResponse::error('Identifiants invalides', 403);
    }


    /**
     * Verify the one time password and login the user if it is valid and return the token and user
     */
    public function verifyOneTimePassword(Request $request)
    {
        $validators = validator($request->only('otp', 'uid'), [
            'otp' => 'required|numeric',
            'uid' => 'required|exists:users,uid'
        ]);

        $user = User::where('uid', $request->uid)->first();
        if (!$user) {
            return ApiResponse::error('Utilisateur introuvable', 404);
        }

        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }

        $otp = $user->oneTimePasswords()->where('otp', $request->otp)->first();
        if (!$otp) {
            return ApiResponse::error('Code de connexion invalide', 404);
        }

        // check if the otp is expired
        if ($otp->expires_at < now()) {
            return ApiResponse::error('Code de connexion expiré', 401);
        }

        try {
            DB::beginTransaction();
            // login the user
            $otp->delete();
            if (!$user->enabled) {
                // activate the user
                $user->enabled = true;
                $user->disabled_at = null;
                $user->disabled_reason = null;
                $user->disabled_by = null;
                $user->save();
            }
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            return ApiResponse::throwException($exception);
        }
        $otp->user->append('permissions');

        return ApiResponse::success([
            'token' => $otp->user->createToken('auth_token')->plainTextToken,
            'user' => $otp->user,
        ], "Utilisateur authentifié avec succès !");
    }


    /**
     * Get the authenticated user
     * @creation: 12/05/2024
     * @author bamboguirassy <didegassama@gmail.com>
     */
    public function getCurrentUser(Request $request)
    {
        // if the auth user is disabled, we logout the user
        if (!$request->user()->enabled) {
            auth()->user()->tokens()->delete();
            return ApiResponse::error('Utilisateur inactif', 401);
        }
        $user = User::where('id', $request->user()->id)->first();
        $user->append('permissions');
        return ApiResponse::success($user);
    }

    /**
     * Logout the authenticated user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return ApiResponse::success(null, 'Utilisateur déconnecté avec succès');
    }

    /**
     * Add new user // send email to the user to verify his email with a one time password
     */
    public function store(Request $request)
    {
        $validators = validator($request->all(), [
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'groupeIds' => 'array|required',
            'groupeIds.*' => 'exists:groupes,id',
        ]);

        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }

        try {
            DB::beginTransaction();
            $user = new User($request->all());
            $user->created_by = auth()->id();
            $user->enabled = false;
            $user->password = bcrypt('password');
            $user->saveOrFail();
            // sync groups
            $user->groupes()->sync($request->groupeIds);
            // send email verification email to the user
            $user->generateAndSendEmailVerificationToken();
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            return ApiResponse::throwException($exception);
        }
        $user->load('groupes');
        return ApiResponse::success($user, 'Utilisateur créé avec succès', 201);
    }

    /**
     * Verify user email with the password reset token
     */
    public function verifyEmail($token)
    {
        $emailVerifyToken = EmailVerifyToken::where('token', $token)->first();
        if (!$emailVerifyToken) {
            return ApiResponse::error('Lien invalide ou expiré...', 404);
        }
        try {
            DB::beginTransaction();
            $user = User::where('email', $emailVerifyToken->email)->first();
            if (!$user) {
                return ApiResponse::error('Utilisateur introuvable', 404);
            }
            $user->enabled = true;
            $user->email_verified_at = now();
            $user->saveOrFail();
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            return ApiResponse::throwException($exception);
        }
        return ApiResponse::success($user, 'Email vérifié avec succès');
    }

    /**
     * Reset user password with the password reset token
     */
    public function resetPassword(Request $request, EmailVerifyToken $emailVerifyToken)
    {
        $validators = validator($request->only('password', 'password_confirmation', 'uid'), [
            'password' => 'required|string|min:8|confirmed',
            'uid' => 'required|exists:users,uid'
        ]);

        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }

        try {
            DB::beginTransaction();
            $user = User::where('email', $emailVerifyToken->email)->first();
            if (!$user) {
                return ApiResponse::error('Utilisateur introuvable', 404);
            }
            $user->password = bcrypt($request->password);
            $user->saveOrFail();
            // delete the password reset token
            $emailVerifyToken->deleteOrFail();
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            return ApiResponse::throwException($exception);
        }
        return ApiResponse::success($user, 'Mot de passe modifié avec succès');
    }

    /**
     * Update user in database
     */
    public function update(Request $request, User $user)
    {
        $validators = validator($request->all(), [
            'name' => 'required|string',
            'groupeIds' => 'array|required',
            'groupeIds.*' => 'exists:groupes,id',
        ]);

        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }

        try {
            DB::beginTransaction();
            $user->update($request->only('name', 'groupeIds'));
            // sync groups
            $user->groupes()->sync($request->groupeIds);
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            return ApiResponse::throwException($exception);
        }
        $user->load('groupes');
        return ApiResponse::success($user, 'Utilisateur modifié avec succès');
    }

    public function all(Request $request)
    {
        $users = User::where('enabled', true)->select('id','name','email')->get();
        return ApiResponse::success($users);
    }

    public function getUserIdsAttachedToGroup(Groupe $groupe)
    {
        $userIds = $groupe->users()->pluck('users.id');
        return ApiResponse::success($userIds, 'IDs des utilisateurs récupérés avec succès', 200);
    }

    /**
     * Get user by uid
     */
    public function show(User $user)
    {
        $user->load('groupes');
        return ApiResponse::success($user);
    }

    /**
     * Delete user by uid
     */
    public function destroy(User $user)
    {
        try {
            $user->delete();
            return ApiResponse::success(null, 'Utilisateur supprimé avec succès');
        } catch (Throwable $exception) {
            return ApiResponse::throwException($exception);
        }
    }

    /**
     * Enable user
     */
    public function enable(User $user)
    {
        // check if the user is already enabled
        if ($user->enabled) {
            return ApiResponse::error('Utilisateur déjà activé', 400);
        }
        try {
            $user->enabled = true;
            $user->disabled_at = null;
            $user->disabled_reason = null;
            $user->disabled_by = null;
            $user->save();
            return ApiResponse::success($user, 'Utilisateur activé avec succès');
        } catch (Throwable $exception) {
            return ApiResponse::throwException($exception);
        }
    }

    /**
     * Disable user
     */
    public function disable(Request $request, User $user)
    {
        // check if the user is already disabled
        if (!$user->enabled) {
            return ApiResponse::error('Utilisateur déjà désactivé', 400);
        }
        $validators = validator($request->only('disabled_reason'), [
            'disabled_reason' => 'required|string',
        ]);

        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }

        try {
            DB::beginTransaction();
            $user->enabled = false;
            $user->disabled_at = now();
            $user->disabled_reason = $request->disabled_reason;
            $user->disabled_by = auth()->id();
            $user->save();
            // logout the user with all his tokens
            $user->tokens()->delete();
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            return ApiResponse::throwException($exception);
        }
        return ApiResponse::success($user, 'Utilisateur désactivé avec succès');
    }

    /**
     * Change password with the old password
     */
    public function changePassword(Request $request)
    {
        $validators = validator($request->only('old_password', 'password', 'password_confirmation'), [
            'old_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed|different:old_password',
        ]);

        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }

        // verifier si l'ancien mot de passe est correct en le comparant avec le mot de passe actuel
        if (!password_verify($request->old_password, auth()->user()->password)) {
            return ApiResponse::error('Ancien mot de passe incorrect', 400);
        }

        try {
            DB::beginTransaction();
            // generate a one time password and send it to the user
            $oneTimePassword = new OneTimePassword(['user_id' => auth()->id()]);
            $oneTimePassword->saveOrFail();
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            return ApiResponse::throwException($exception);
        }
        return ApiResponse::success(null, 'Un code de connexion a été envoyé à votre adresse email');
    }

    /**
     * Confirm change password with the one time password
     */
    public function confirmChangePassword(Request $request)
    {
        $validators = validator($request->only('otp', 'password', 'old_password', 'password_confirmation'), [
            'otp' => 'required|numeric',
            'password' => 'required|string|min:8|confirmed|different:old_password',
            'old_password' => 'required|string',
        ]);
        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }
        // recheck the old password
        if (!password_verify($request->old_password, auth()->user()->password)) {
            return ApiResponse::error('Ancien mot de passe incorrect', 400);
        }
        $user = User::firstWhere('id', auth()->id());
        // check the otp
        $otp = $user->oneTimePasswords()->where('otp', $request->otp)->first();
        if (!$otp) {
            return ApiResponse::error('Code de connexion invalide', 404);
        }
        // check if the otp is expired
        if ($otp->expires_at < now()) {
            return ApiResponse::error('Code de connexion expiré', 401);
        }
        // change the password
        try {
            DB::beginTransaction();
            $user->password = bcrypt($request->password);
            $user->saveOrFail();
            $otp->delete();
            // logout the user with all his tokens
            $user->tokens()->delete();
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            return ApiResponse::throwException($exception);
        }
        return ApiResponse::success(null, 'Mot de passe modifié avec succès');
    }

    /**
     * Forgot password
     */
    public function forgotPassword(Request $request)
    {
        $validators = validator($request->only('email'), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }
        $user = User::where('email', $request->email)->first();
        // check if the user is disabled
        if (!$user->enabled) {
            return ApiResponse::error('Utilisateur inactif', 401);
        }

        try {
            DB::beginTransaction();
            // generate a password reset token and send it to the user
            $user->generateAndSendEmailVerificationToken();
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            return ApiResponse::throwException($exception);
        }
        return ApiResponse::success(null, 'Un email de réinitialisation de mot de passe a été envoyé à votre adresse email');
    }

    /**
     * Link groupes to user
     */
    public function linkGroupes(Request $request, User $user)
    {
        $validators = validator($request->only('groupeIds'), [
            'groupeIds' => 'array|required',
            'groupeIds.*' => 'exists:groupes,id',
        ]);

        if ($validators->fails()) {
            return ApiResponse::invalidate($validators);
        }

        try {
            DB::beginTransaction();
            $user->groupes()->sync($request->groupeIds);
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            return ApiResponse::throwException($exception);
        }
        $user->load('groupes');
        return ApiResponse::success($user, 'Groupes liés avec succès');
    }

    /**
     * Find linked groupes to user
     */
    public function findLinkedGroupes(User $user)
    {
        $groupes = $user->groupes;
        return ApiResponse::success($groupes);
    }

    public function broadcastAuthUser(Request $request)
    {
        return response()->json([
            'auth' => $request->token,
            'user' => $request->user()
        ]);
    }

    public function broadcastAuthChannel(Request $request)
    {
        $user = $request->user();
        $socketId = $request->socket_id;
        $channelName = $request->channel_name;

        if ($user) {
            $pusher = new \Pusher\Pusher(
                config('broadcasting.connections.pusher.key'),
                config('broadcasting.connections.pusher.secret'),
                config('broadcasting.connections.pusher.app_id'),
                [
                    'cluster' => config('broadcasting.connections.pusher.options.cluster'),
                    'useTLS' => true
                ]
            );

            $auth = $pusher->socket_auth($channelName, $socketId);

            return response($auth);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
    }
}
