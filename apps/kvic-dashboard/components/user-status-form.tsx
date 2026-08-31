'use client';

import { updateUserStatusAction } from '@/app/actions';

export function UserStatusForm({ id, name, status, returnTo }: { id: string; name: string; status: string; returnTo: string }) {
  const nextStatus = status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
  const verb = nextStatus === 'ACTIVE' ? 'Re-enable' : 'Disable';
  return <form action={updateUserStatusAction} onSubmit={(event) => {
    if (!window.confirm(`${verb} ${name}? ${nextStatus === 'DISABLED' ? 'They will no longer be able to sign in.' : 'Their account access will be restored.'}`)) event.preventDefault();
  }}>
    <input type="hidden" name="id" value={id}/>
    <input type="hidden" name="status" value={nextStatus}/>
    <input type="hidden" name="returnTo" value={returnTo}/>
    <button className="button compact" type="submit">{verb}</button>
  </form>;
}
