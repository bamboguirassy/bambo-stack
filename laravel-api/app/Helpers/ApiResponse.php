<?php

namespace App\Helpers;

use Illuminate\Contracts\Validation\Validator;
use Throwable;

class ApiResponse
{
    public static function success($data, $message = null, $code = 200)
    {
        return response()->json([
            'error' => 0,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    public static function throwException(Throwable $exception)
    {
        return response()->json([
            'error' => true,
            'message' => $exception->getMessage(),
            'trace' => config('app.env') != "production" ? $exception->getTrace() : null,
        ], 500);
    }

    public static function invalidate(Validator $validator)
    {
        if (!$validator->fails()) {
            throw new \Exception('Invalid validator instance as it does not fail');
        }
        return response()->json([
            'error' => true,
            'validation' => true, // this is to differentiate from other errors
            'message' => 'Invalid input',
            'errors' => $validator->errors(),
        ], 422);
    }

    public static function error($message = 'Error', $code = 500)
    {
        return response()->json([
            'error' => true,
            'message' => $message,
        ], $code);
    }
}
