from django.core.management.base import BaseCommand
from django.db import transaction
from admin_panel.models import AuditLog


class Command(BaseCommand):
    help = 'Xóa bớt dữ liệu audit log, chỉ giữ lại 1000 bản ghi mới nhất'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep',
            type=int,
            default=1000,
            help='Số lượng audit log mới nhất cần giữ lại (mặc định: 1000)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Chỉ hiển thị số lượng bản ghi sẽ bị xóa mà không thực hiện xóa'
        )

    def handle(self, *args, **options):
        keep_count = options['keep']
        dry_run = options['dry_run']
        
        self.stdout.write(
            self.style.SUCCESS(f'Bắt đầu dọn dẹp audit logs, giữ lại {keep_count} bản ghi mới nhất...')
        )

        # Đếm tổng số audit logs hiện tại
        total_logs = AuditLog.objects.count()
        self.stdout.write(f'Tổng số audit logs hiện tại: {total_logs}')

        if total_logs <= keep_count:
            self.stdout.write(
                self.style.WARNING(f'Không cần xóa. Số lượng hiện tại ({total_logs}) <= số lượng cần giữ ({keep_count})')
            )
            return

        # Tính số lượng cần xóa
        delete_count = total_logs - keep_count
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'DRY RUN: Sẽ xóa {delete_count} audit logs cũ')
            )
            return

        # Lấy ID của bản ghi thứ keep_count (sắp xếp theo timestamp giảm dần)
        try:
            with transaction.atomic():
                # Lấy timestamp của bản ghi thứ keep_count bằng cách convert QuerySet thành list
                logs_to_keep = list(AuditLog.objects.order_by('-timestamp')[:keep_count])
                
                if logs_to_keep:
                    # Lấy timestamp của bản ghi cuối cùng trong danh sách (cũ nhất trong số cần giữ)
                    oldest_timestamp_to_keep = logs_to_keep[-1].timestamp
                    
                    # Xóa tất cả các bản ghi cũ hơn timestamp này
                    deleted_logs = AuditLog.objects.filter(
                        timestamp__lt=oldest_timestamp_to_keep
                    ).delete()
                    
                    deleted_count = deleted_logs[0]  # Số lượng bản ghi đã xóa
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'Đã xóa thành công {deleted_count} audit logs cũ')
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f'Còn lại {AuditLog.objects.count()} audit logs')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING('Không tìm thấy audit logs nào để xử lý')
                    )
                    
        except Exception as e:
            self.stderr.write(
                self.style.ERROR(f'Lỗi khi xóa audit logs: {str(e)}')
            )
            raise e

        self.stdout.write(
            self.style.SUCCESS('Hoàn thành dọn dẹp audit logs!')
        )
