import { useState } from "react";
import { Check } from "lucide-react";
import { createGroupRequest } from "../../api/rooms.api";
import { useUsers } from "../../hooks/useUsers";
import { getApiErrorMessage } from "../../utils/apiError";
import type { IRoom } from "../../types";
import { Modal } from "../shared/Modal";
import { ListRow } from "../shared/ListRow";
import { Button } from "../shared/Button";
import { Spinner } from "../shared/Spinner";

interface CreateGroupModalProps {
  onClose: () => void;
  onCreated: (room: IRoom) => void;
}

export function CreateGroupModal({ onClose, onCreated }: CreateGroupModalProps) {
  const { users, isLoading } = useUsers();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleCreate = async () => {
    if (!name.trim() || selected.size === 0) return;
    setLoading(true);
    setError(null);
    try {
      const { room } = await createGroupRequest({
        name: name.trim(),
        memberIds: Array.from(selected),
      });
      onCreated(room);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't create the group"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="New group"
      onClose={onClose}
      footer={
        <Button
          fullWidth
          onClick={handleCreate}
          isLoading={loading}
          disabled={!name.trim() || selected.size === 0}
        >
          {selected.size > 0 ? `Create group (${selected.size})` : "Create group"}
        </Button>
      }
    >
      <div className="px-4 py-3">
        <label htmlFor="group-name" className="sr-only">
          Group name
        </label>
        <input
          id="group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          className="w-full rounded-lg border border-line bg-input px-3 py-2 text-sm text-fg outline-none placeholder:text-faint focus:border-brand"
        />
        {error && (
          <p role="alert" className="mt-2 text-xs text-danger">
            {error}
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        {isLoading ? (
          <div className="flex justify-center py-8 text-muted">
            <Spinner />
          </div>
        ) : (
          users.map((user) => {
            const checked = selected.has(user._id);
            return (
              <ListRow
                key={user._id}
                avatarName={user.name}
                avatarUrl={user.avatarUrl}
                avatarSize={40}
                title={user.name}
                subtitle={user.email}
                role="checkbox"
                ariaChecked={checked}
                onClick={() => toggle(user._id)}
                trailing={
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                      checked ? "border-brand bg-brand text-canvas" : "border-muted"
                    }`}
                  >
                    {checked && <Check size={12} strokeWidth={3} />}
                  </span>
                }
              />
            );
          })
        )}
      </div>
    </Modal>
  );
}
