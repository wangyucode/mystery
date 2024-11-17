import { User } from "@nextui-org/react";

export default function ExtraRoleContent({ extra, room }) {

    return (
        <div className="flex flex-col gap-2 items-start">
            <p className="text-sm whitespace-pre-line">
                <b>背景故事：</b>{extra.background}
            </p>
            <div className="flex flex-col gap-2">
                <b>角色列表：</b>
                {extra.roles.map(r => (
                    <User
                        name={r.name}
                        avatarProps={{ src: `/avatars/${room.title}/${r.name}.png` }}
                        key={r.name}
                        description={r.desc}
                    />
                ))}
            </div>
        </div>
    );
}