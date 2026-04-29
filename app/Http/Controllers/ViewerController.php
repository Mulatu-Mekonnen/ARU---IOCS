<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use App\Models\Office;
use App\Models\Announcement;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ViewerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();

        $stats = [
            'totalAgendas' => Agenda::count(),
            'pendingAgendas' => Agenda::where('status', 'PENDING')->count(),
            'approvedAgendas' => Agenda::where('status', 'APPROVED')->count(),
            'rejectedAgendas' => Agenda::where('status', 'REJECTED')->count(),
            'forwardedAgendas' => Agenda::where('status', 'FORWARDED')->count(),
        ];

        $announcements = Announcement::with('author')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard/Viewer/Dashboard', [
            'stats' => $stats,
            'announcements' => $announcements,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function inbox(Request $request)
    {
        $agendas = Agenda::where('status', 'APPROVED')
            ->with(['createdBy', 'senderOffice', 'receiverOffice'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard/Viewer/Inbox/Index', [
            'agendas' => $agendas,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function notifications(Request $request)
    {
        $notifications = [
            [
                'id' => '1',
                'type' => 'new_communication',
                'title' => 'New Agenda Received',
                'message' => 'A new approved agenda has been added. Check your inbox for details.',
                'timestamp' => now()->subHours(2)->toIso8601String(),
                'priority' => 'high',
                'read' => false,
                'actionUrl' => '/dashboard/viewer/inbox',
            ],
            [
                'id' => '2',
                'type' => 'communication_approved',
                'title' => 'Agenda Approved',
                'message' => 'An agenda has been approved and is ready for review.',
                'timestamp' => now()->subHours(6)->toIso8601String(),
                'priority' => 'medium',
                'read' => false,
                'actionUrl' => '/dashboard/viewer/inbox',
            ],
            [
                'id' => '3',
                'type' => 'communication_forwarded',
                'title' => 'Agenda Forwarded',
                'message' => 'An approved agenda was forwarded to another office.',
                'timestamp' => now()->subDays(1)->toIso8601String(),
                'priority' => 'low',
                'read' => true,
                'actionUrl' => '/dashboard/viewer/inbox',
            ],
        ];

        return Inertia::render('Dashboard/Viewer/Notifications/Index', [
            'notifications' => $notifications,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function archive(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        $agendas = Agenda::where('current_office_id', $office->id)
            ->where('status', 'ARCHIVED')
            ->with(['createdBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard/Viewer/Archive/Index', [
            'agendas' => $agendas,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function announcements(Request $request)
    {
        $announcements = Announcement::with(['author'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard/Viewer/Announcements/Index', [
            'announcements' => $announcements,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }
}