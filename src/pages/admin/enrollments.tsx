import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, setStudentCourses } = useEnrollmentStore();

  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");
  const studentPickerAnchor = useComboboxAnchor();

  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  const availableStudentLabels = formCourse
    ? students
      .filter((student) => !student.enrolledCourses.includes(formCourse))
      .map(
        (student) =>
          `${student.studentId} — ${student.firstName} ${student.lastName}`,
      )
    : [];

  const selectedStudents = students.filter((student) =>
    formStudents.includes(
      `${student.studentId} — ${student.firstName} ${student.lastName}`,
    ),
  );

  const handleEnroll = () => {
    if (!formCourse || selectedStudents.length === 0) return;

    selectedStudents.forEach((student) => {
      setStudentCourses(student.studentId, [
        ...student.enrolledCourses,
        formCourse,
      ]);
    });

    setEnrollDialogOpen(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
  // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormCourse(null);
      setFormStudents([]);
    }
  };

  const visibleCourses = courses.filter((course) => {
    const matchesCourse =
      mode !== "course" ||
      filterCourse === "all" ||
      course.courseCode === filterCourse;

    const matchesStudent =
      mode !== "student" ||
      filterStudent === "all" ||
      students.some(
        (student) =>
          student.studentId === filterStudent &&
          student.enrolledCourses.includes(course.courseCode),
      );

    return matchesCourse && matchesStudent;
  });


  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog open={enrollDialogOpen} onOpenChange={handleEnrollDialogOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ยังไม่ได้ลงทะเบียน
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={(value) => {
                  setFormCourse(value);
                  setFormStudents([]);
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>นักศึกษา</Label>
              <Combobox
                multiple
                disabled={!formCourse}
                items={availableStudentLabels}
                value={formStudents}
                onValueChange={(value) => setFormStudents(value as string[])}
              >
                <ComboboxChips ref={studentPickerAnchor}>
                  <ComboboxValue>
                    {(selected: string[]) =>
                      selected.map((label) => (
                        <ComboboxChip key={label}>
                          {label.split(" — ")[1]}
                        </ComboboxChip>
                      ))
                    }
                  </ComboboxValue>
                  <ComboboxChipsInput
                    placeholder={
                      formCourse ? "เลือกนักศึกษาได้หลายคน" : "เลือกวิชาก่อน"
                    }
                  />
                </ComboboxChips>
                <ComboboxContent anchor={studentPickerAnchor}>
                  <ComboboxList>
                    {availableStudentLabels.map((label) => (
                      <ComboboxItem key={label} value={label}>
                        {label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!formCourse || formStudents.length === 0}
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน ({formStudents.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleCourses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {visibleCourses.map((course) => {
              const enrolledStudents = students.filter(
                (student) =>
                  student.enrolledCourses.includes(course.courseCode) &&
                  (mode !== "student" ||
                    filterStudent === "all" ||
                    student.studentId === filterStudent),
              );

              return (
                <TableRow key={course.courseCode}>
                  <TableCell>{course.courseCode}</TableCell>
                  <TableCell>{course.courseTitle}</TableCell>
                  <TableCell>{enrolledStudents.length}</TableCell>
                  <TableCell>
                    {enrolledStudents.length > 0
                      ? enrolledStudents.map((student) => (
                        <Badge key={student.studentId} className="m-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-200">
                          {student.firstName} {student.lastName}
                          <button
                            type="button"
                            aria-label={`ลบผู้สอน ${student}`}
                            onClick={() =>
                              setStudentCourses(
                                student.studentId,
                                student.enrolledCourses.filter(
                                  (code) => code !== course.courseCode
                                )
                              )
                            }
                            className="  hover:text-red-700"
                          >
                            X
                          </button>
                        </Badge>
                      ))
                      :
                      <p className="text-gray-500"> ยังไม่มีนักศึกษาลงทะเบียน</p>
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
