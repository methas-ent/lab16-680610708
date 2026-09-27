interface FooterProps {
    firstName: string;
    lastName: string;
    studentId: string;
}

export default function Footer({ firstName, lastName, studentId }: FooterProps) {
    return (
        <p className="border-t p-4 text-center text-xs text-muted-foreground">
            จัดทำโดย {firstName} {lastName} - รหัสนักศึกษา {studentId}
        </p>
    )
};
