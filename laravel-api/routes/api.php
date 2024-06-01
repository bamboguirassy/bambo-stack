<?php

use App\Notifications\TestPusherNotification;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Broadcast::routes(['middleware' => ['auth:sanctum']]);
Route::middleware(['throttle:api'])->group(function () {
    // user routes
    Route::post('/user/login', 'App\Http\Controllers\UserController@login');
    Route::post('/user/verify', 'App\Http\Controllers\UserController@verifyOneTimePassword');
    Route::post('/user/verify-email/{token}', 'App\Http\Controllers\UserController@verifyEmail');
    Route::post('/user/reset-password/{emailVerifyToken:token}', 'App\Http\Controllers\UserController@resetPassword');
    Route::post('/user/forgot-password', 'App\Http\Controllers\UserController@forgotPassword');
    //verifier si l'utilisateur est actif avant de continuer la requete
    Route::middleware(['check.user.enabled', 'auth:sanctum'])->group(function () {
        // route for /broadcasting/auth
        Route::post('/broadcasting/auth', 'App\Http\Controllers\UserController@broadcastAuthUser');
        Route::post('/broadcasting/auth/channel', 'App\Http\Controllers\UserController@broadcastAuthChannel');
        // Test pusher route
        Route::get('/pusher', function () {
            auth()->user()->notify(new TestPusherNotification);
            return response()->json(['message' => 'Pusher event sent!']);
        });
        // get current user
        Route::get('/user/current', 'App\Http\Controllers\UserController@getCurrentUser');
        Route::post('/user/logout', 'App\Http\Controllers\UserController@logout');

      // AJOUT DE ROUT last_activity_at
            Route::get('user/logout','App\Http\Controllers\UserController@logout' );
        Route::post('/user/change-password', 'App\Http\Controllers\UserController@changePassword');
        Route::post('/user/confirm-change-password', 'App\Http\Controllers\UserController@confirmChangePassword');
        // user routes
        Route::post('user/search', 'App\Http\Controllers\UserController@search')->middleware('check:VIEW-USERS');
        Route::get('user/all', 'App\Http\Controllers\UserController@all');
        Route::post('user/{user:uid}/enable', 'App\Http\Controllers\UserController@enable')->middleware('check:ENABLE-USER');
        Route::post('user/{user:uid}/disable', 'App\Http\Controllers\UserController@disable')->middleware('check:DISABLE-USER');
        Route::get('user/{user:uid}', 'App\Http\Controllers\UserController@show')->middleware('check:VIEW-USER');
        Route::put('user/{user:uid}', 'App\Http\Controllers\UserController@update')->middleware('check:EDIT-USER');
        Route::delete('user/{user:uid}', 'App\Http\Controllers\UserController@destroy')->middleware('check:DELETE-USER');
        Route::post('user', 'App\Http\Controllers\UserController@store')->middleware('check:ADD-USER');
        Route::post('user/{user:uid}/link-groupes', 'App\Http\Controllers\UserController@linkGroupes')->middleware('check:ADD-USER-TO-GROUP');
        Route::get('user/{user:uid}/linked-groupes', 'App\Http\Controllers\UserController@findLinkedGroupes')->middleware('check:VIEW-GROUP-USERS');
        Route::get('user/{groupe:uid}/ids-attached-groupe', 'App\Http\Controllers\UserController@getUserIdsAttachedToGroup');

        // group routes
        Route::get('groupe/permissions', 'App\Http\Controllers\GroupeController@getPermissions');
        Route::get('groupe', 'App\Http\Controllers\GroupeController@index')->middleware('check:VIEW-GROUPS');
        Route::get('groupe/all', 'App\Http\Controllers\GroupeController@all');
        Route::post('groupe', 'App\Http\Controllers\GroupeController@store')->middleware('check:ADD-GROUP');
        Route::post('groupe/{groupe:uid}/enable', 'App\Http\Controllers\GroupeController@enable')->middleware('check:ENABLE-DISABLE-GROUP');
        Route::post('groupe/{groupe:uid}/disable', 'App\Http\Controllers\GroupeController@disable')->middleware('check:ENABLE-DISABLE-GROUP');
        Route::get('groupe/{groupe:uid}', 'App\Http\Controllers\GroupeController@show')->middleware('check:VIEW-GROUP');
        Route::put('groupe/{groupe:uid}', 'App\Http\Controllers\GroupeController@update')->middleware('check:EDIT-GROUP');
        Route::delete('groupe/{groupe:uid}', 'App\Http\Controllers\GroupeController@destroy')->middleware('check:DELETE-GROUP');
        // user groupes routes
        Route::get('usergroupe/{groupe:uid}/groupe', 'App\Http\Controllers\UserGroupeController@findByGroupe')->middleware('check:VIEW-GROUP-USERS');
        Route::delete('usergroupe/{userGroupe}', 'App\Http\Controllers\UserGroupeController@destroy')->middleware('check:REMOVE-USER-FROM-GROUP');
        Route::post('usergroupe', 'App\Http\Controllers\UserGroupeController@store')->middleware('check:ADD-USER-TO-GROUP');
        Route::post('usergroupe/{groupe:uid}/users', 'App\Http\Controllers\UserGroupeController@linkUsersToGroupe');       
        // piece jointe routes
        Route::get('piecejointe/{parentType}/{parentId}', 'App\Http\Controllers\PieceJointeController@findByParent');
        Route::post('piecejointe', 'App\Http\Controllers\PieceJointeController@store');
        Route::put('piecejointe/{pieceJointe:uid}', 'App\Http\Controllers\PieceJointeController@update');
        Route::delete('piecejointe/{pieceJointe:uid}', 'App\Http\Controllers\PieceJointeController@destroy');
    });
});
