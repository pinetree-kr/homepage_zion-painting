import { useState } from 'react';
import { User } from '../../types';
import { UserCog, Mail, Lock, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';

interface UserSettingsProps {
  user: User;
  onSave: (updatedUser: Partial<User>) => void;
  onCancel: () => void;
}

export function UserSettings({ user, onSave, onCancel }: UserSettingsProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호 변경하는 경우
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('새 비밀번호가 일치하지 않습니다');
        return;
      }
      if (formData.newPassword.length < 6) {
        toast.error('비밀번호는 최소 6자 이상이어야 합니다');
        return;
      }
      if (!formData.currentPassword) {
        toast.error('현재 비밀번호를 입력해주세요');
        return;
      }
    }

    const updatedData: Partial<User> & { currentPassword?: string; newPassword?: string } = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.newPassword) {
      updatedData.currentPassword = formData.currentPassword;
      updatedData.newPassword = formData.newPassword;
    }

    onSave(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">사용자 정보 수정</h1>
          <p className="text-muted-foreground">
            프로필 정보 및 비밀번호를 변경할 수 있습니다
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 프로필 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              프로필 정보
            </CardTitle>
            <CardDescription>
              기본 프로필 정보를 수정합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 아바타 */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB]">
                <AvatarFallback className="bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] text-white text-2xl">
                  {formData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">
                  프로필 사진은 이름의 첫 글자로 표시됩니다
                </p>
              </div>
            </div>

            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="이름을 입력하세요"
                required
              />
            </div>

            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* 역할 (읽기 전용) */}
            <div className="space-y-2">
              <Label>역할</Label>
              <Input
                value={user.role === 'admin' ? '관리자' : '사용자'}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* 비밀번호 변경 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              비밀번호 변경
            </CardTitle>
            <CardDescription>
              비밀번호를 변경하려면 아래 필드를 모두 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 현재 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="현재 비밀번호"
                  className="pl-10"
                />
              </div>
            </div>

            {/* 새 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="새 비밀번호 (최소 6자)"
                  className="pl-10"
                />
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="새 비밀번호 확인"
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] hover:opacity-90">
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>
      </form>
    </div>
  );
}
