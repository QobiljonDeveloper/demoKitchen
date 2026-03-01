import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User, MapPin } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';

export function Header() {
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const branchId = user?.branchId;
    const branchName = user?.branchName;

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 lg:px-8">
            {/* Branch indicator */}
            <div className="flex items-center">
                {branchName && (
                    <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${branchId === 1
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            }`}
                    >
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{branchName}</span>
                    </div>
                )}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
                <ThemeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <User className="h-5 w-5" />
                            <span className="sr-only">Foydalanuvchi menyusi</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">Admin</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email || 'admin@kitchen.com'}
                                </p>
                                {branchName && (
                                    <p className={`text-xs leading-none font-medium mt-1 ${branchId === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                                        }`}>
                                        📍 {branchName}
                                    </p>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Sozlamalar</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Chiqish</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
