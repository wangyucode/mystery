import { Modal, ModalContent, ModalHeader } from "@nextui-org/react";
import ExtraRoleContent from "./ExtraRoleContent";

export default function ExtraModal({ open, title, extra, room, onClose }) {

    return (
        <Modal isOpen={open} onClose={onClose}>
            <ModalContent>
                <ModalHeader>{title}</ModalHeader>
                {extra.roles && <ExtraRoleContent extra={extra} room={room} />}
            </ModalContent>
        </Modal>
    );
}