<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name', 'ARU - IOCS') }}</title>
    
    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- Scripts -->
    @vite(['resources/js/app.jsx'])
    
    <!-- Styles -->
    @vite(['resources/css/app.css'])
</head>
<body class="bg-gray-100 font-sans leading-normal tracking-tight">
    <div id="app" data-page="{{ json_encode($page) }}">
    </div>
</body>
</html>
