import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { User } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile, type Profile } from "@/lib/profile-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — BurnoutGuard" },
      {
        name: "description",
        content: "Manage your personal profile information.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, updateProfile } = useProfile();
  const [form, setForm] = useState<Profile>(profile);

  const save = () => {
    updateProfile(form);
    toast.success("Profile saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your personal information, kept just for you.
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <User className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {form.name || "Your name"}
            </p>
            <p className="text-xs text-muted-foreground">
              {form.university || "Your university"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              placeholder="e.g. Hafidh Alghifari"
              className="mt-1.5"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="university">University</Label>
            <Input
              id="university"
              value={form.university}
              placeholder="e.g. Universitas Indonesia"
              className="mt-1.5"
              onChange={(e) => setForm({ ...form, university: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="major">Major / Prodi</Label>
              <Input
                id="major"
                value={form.major}
                placeholder="e.g. Teknik Informatika"
                className="mt-1.5"
                onChange={(e) => setForm({ ...form, major: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                value={form.semester}
                placeholder="e.g. 5"
                className="mt-1.5"
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="concerns">Issues / Concerns</Label>
            <Textarea
              id="concerns"
              value={form.concerns}
              placeholder="Apa yang sedang jadi masalah atau keluhanmu akhir-akhir ini?"
              className="mt-1.5"
              onChange={(e) => setForm({ ...form, concerns: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="interests">Interests / Hobbies</Label>
            <Textarea
              id="interests"
              value={form.interests}
              placeholder="Apa minat atau hobi yang kamu nikmati?"
              className="mt-1.5"
              onChange={(e) => setForm({ ...form, interests: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button className="rounded-full" onClick={save}>
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
