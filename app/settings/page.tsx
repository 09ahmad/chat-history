"use client";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
          
          <div className="space-y-8">
            {/* Profile Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex justify-center items-center bg-gray-200 font-bold w-10 rounded-2xl ">
                {session?.user?.name && (
                  <div>{session.user?.name.charAt(0).toUpperCase()}</div>
                )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-gray-600">{session?.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications about your chat activity</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Auto-save Conversations</p>
                    <p className="text-sm text-gray-600">Automatically save your conversations</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </div>
            </div>

            {/* Data Management Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Management</h2>
              <div className="space-y-4">
                <Button variant="outline">Export Chat History</Button>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Delete All Data
                </Button>
              </div>
            </div>

            {/* Account Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>
              <Button 
                onClick={() => signOut({ callbackUrl: "/" })}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 