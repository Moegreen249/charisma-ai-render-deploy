'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Select } from '@/components/ui/select';

interface InviteResult {
  email: string;
  success: boolean;
  error?: string;
  tempPassword?: string;
}

export default function InviteUsersForm() {
  const [users, setUsers] = useState([{ email: '', name: '', role: 'USER' }]);
  const [results, setResults] = useState<InviteResult[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddUser = () => {
    setUsers([...users, { email: '', name: '', role: 'USER' }]);
  };

  const handleRemoveUser = (index: number) => {
    setUsers(users.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newUsers = [...users];
    newUsers[index] = { ...newUsers[index], [field]: value };
    setUsers(newUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResults([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/invite-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ users }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitations');
      }

      setResults(data.results);
      // Clear form if all successful
      if (data.results.every((r: InviteResult) => r.success)) {
        setUsers([{ email: '', name: '', role: 'USER' }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Invite Users</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {results.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Results:</h2>
          {results.map((result, index) => (
            <Alert
              key={index}
              variant={result.success ? 'default' : 'destructive'}
              className="mb-2"
            >
              {result.email}: {result.success ? 'Invited successfully' : result.error}
              {result.success && result.tempPassword && (
                <div className="mt-1 text-sm">
                  Temporary password: {result.tempPassword}
                </div>
              )}
            </Alert>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {users.map((user, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={user.email}
                  onChange={(e) => handleChange(index, 'email', e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input
                  type="text"
                  value={user.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  required
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium mb-1">
                  Role
                </label>
                <Select
                  value={user.role}
                  onValueChange={(value) => handleChange(index, 'role', value)}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </div>
            </div>
            {users.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveUser(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={handleAddUser}>
            Add Another User
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending Invitations...' : 'Send Invitations'}
          </Button>
        </div>
      </form>
    </div>
  );
}
