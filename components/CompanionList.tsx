import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, getSubjectColor } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface CompanionWithMeta {
  id: string;
  subject: string;
  name: string;
  topic: string;
  duration: number;
  sessionId?: string;
  bookmarkId?: string;
  sessionCreatedAt?: string;
}

interface ComapanionsListProps {
  title: string;
  companions?: CompanionWithMeta[];
  classNames?: string;
  hideTitle?: boolean;
}


const CompanionList = ({ title, companions, classNames, hideTitle = false }: ComapanionsListProps) => {
  if (!companions || companions.length === 0) {
    return (
      <div className={cn('py-10 flex flex-col items-center justify-center text-center', classNames)}>
        <div className="size-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-200/80">
          <Image src="/icons/cap.svg" alt="Empty" width={22} height={22} className="opacity-40" />
        </div>
        <p className="font-bold text-neutral-800 text-base">No {title.toLowerCase()} found</p>
        <p className="text-xs text-neutral-400 mt-1 max-w-xs font-mono">
          Start exploring our AI tutors to build your personalized history.
        </p>
      </div>
    );
  }

  return (
    <article className={cn('companion-list border-none p-0 shadow-none bg-transparent', classNames)}>
      {!hideTitle && <h2 className="font-bold text-2xl text-[#0F0F10] mb-4">{title}</h2>}

      <Table>

        <TableHeader>
          <TableRow>
            <TableHead className="text-lg w-2/3">Lessons</TableHead>
            <TableHead className="text-lg">Subject</TableHead>
            <TableHead className="text-lg text-right">Duration</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {companions?.map((companion) => {
            // Use unique key: sessionId for sessions, bookmarkId for bookmarks, fallback to companion id
            const uniqueKey = companion.sessionId || companion.bookmarkId || companion.id;
            const validSubjects = ["maths", "language", "science", "history", "coding", "economics"];
            const rawSubject = companion.subject?.toLowerCase();
            const subjectIcon = rawSubject && validSubjects.includes(rawSubject)
              ? `/icons/${rawSubject}.svg`
              : "/icons/cap.svg";
            const subjectAlt = companion.subject || companion.name || "Companion icon";
            const subjectBgColor = getSubjectColor(companion.subject);

            return (
              <TableRow key={uniqueKey}>
                <TableCell>
                  <Link href={companion.id ? `/companions/${companion.id}` : "#"}>
                    <div className="flex items-center gap-2">
                      <div className="size-[72px] flex items-center justify-center rounded-lg max-md:hidden"
                        style={{ backgroundColor: subjectBgColor }}>
                        <Image
                          src={subjectIcon}
                          alt={subjectAlt}
                          width={35}
                          height={35}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="font-bold text-xl">{companion.name || "Untitled Companion"}</p>
                        <p className="text-lg">{companion.topic || "General Discussion"}</p>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="subject-badge w-fit max-md:hidden">{companion.subject || "General"}</div>
                  <div className="flex items-center justify-center rounded-lg w-fit p-2 md:hidden"
                    style={{ backgroundColor: subjectBgColor }}>
                    <Image src={subjectIcon}
                      alt={subjectAlt}
                      width={18}
                      height={18} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 w-full justify-end">
                    <p className="text-2xl">{companion.duration ?? 15} {' '}
                      <span className="max-md:hidden">mins</span>
                    </p>
                    <Image src="/icons/clock.svg"
                      alt="minutes"
                      width={14}
                      height={14}
                      className="md:hidden" />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </article>
  )
}
export default CompanionList;